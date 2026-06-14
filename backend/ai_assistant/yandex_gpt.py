import json
import os
import socket
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    import requests
    _HAS_REQUESTS = True
except Exception:
    requests = None
    _HAS_REQUESTS = False

YANDEX_API_KEY = os.getenv('YANDEX_API_KEY') or os.getenv('YANDEX_IAM_TOKEN')
YANDEX_GPT_MODEL = os.getenv('YANDEX_GPT_MODEL', 'yandex-gpt-3.5')
YANDEX_GPT_ENDPOINT = os.getenv(
    'YANDEX_GPT_ENDPOINT',
    f'gpt://b1gtun08c2i8n7n9qmlf/yandexgpt-lite',
)

DEFAULT_PARAMETERS = {
    'temperature': 0.5,
    'max_output_tokens': 512,
}


def is_yandex_configured() -> bool:
    return bool(YANDEX_API_KEY)


def _parse_response_body(body: str) -> str:
    data = json.loads(body)
    outputs = data.get('outputs') or data.get('choices') or []

    if isinstance(outputs, dict):
        outputs = [outputs]

    texts = []
    for output in outputs:
        if not isinstance(output, dict):
            continue
        if 'content' in output and isinstance(output['content'], list):
            for item in output['content']:
                if isinstance(item, dict) and item.get('type') == 'text':
                    texts.append(item.get('text', ''))
        if 'text' in output and isinstance(output['text'], str):
            texts.append(output['text'])
        if 'message' in output and isinstance(output['message'], dict):
            message = output['message']
            if 'content' in message and isinstance(message['content'], list):
                for item in message['content']:
                    if isinstance(item, dict) and item.get('type') == 'text':
                        texts.append(item.get('text', ''))
        if 'output_text' in output and isinstance(output['output_text'], str):
            texts.append(output['output_text'])

    if texts:
        return '\n'.join(texts).strip()

    if isinstance(data.get('result'), str):
        return data['result'].strip()

    raise ValueError('Не удалось разобрать ответ YandexGPT')


def generate_yandex_answer(question: str) -> str:
    if not is_yandex_configured():
        raise RuntimeError('YandexGPT не настроен: установите переменную окружения YANDEX_API_KEY или YANDEX_IAM_TOKEN')

    payload = {
        'input': question,
        'parameters': DEFAULT_PARAMETERS,
    }
    headers = {
        'Authorization': f'Bearer {YANDEX_API_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    # Prefer requests (respects environment proxies), fall back to urllib
    if _HAS_REQUESTS:
        try:
            resp = requests.post(YANDEX_GPT_ENDPOINT, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            return _parse_response_body(resp.text)
        except requests.exceptions.RequestException as exc:
            # Diagnose common DNS / network errors
            msg = str(exc)
            cause = getattr(exc, '__cause__', None)
            if isinstance(cause, socket.gaierror) or 'Name or service not known' in msg or 'Temporary failure in name resolution' in msg:
                raise RuntimeError(
                    f'Ошибка сети при обращении к YandexGPT: {msg}.\n' 
                    'Проверьте DNS или настройку прокси (HTTPS_PROXY / HTTP_PROXY).'
                )
            raise RuntimeError(f'Ошибка YandexGPT: {msg}')
    else:
        body = json.dumps(payload).encode('utf-8')
        request = Request(YANDEX_GPT_ENDPOINT, data=body, headers=headers, method='POST')
        try:
            with urlopen(request, timeout=30) as response:
                response_body = response.read().decode('utf-8')
                return _parse_response_body(response_body)
        except HTTPError as exc:
            error_body = exc.read().decode('utf-8', errors='ignore')
            message = f'Ошибка YandexGPT: {exc.code} {exc.reason}'
            if error_body:
                message += f' — {error_body}'
            raise RuntimeError(message)
        except URLError as exc:
            reason = exc.reason
            # urllib may wrap socket.gaierror
            if isinstance(reason, socket.gaierror) or 'Name or service not known' in str(reason):
                raise RuntimeError(
                    f'Ошибка сети при обращении к YandexGPT: {reason}.\n'
                    'Проверьте DNS или настройку прокси (HTTPS_PROXY / HTTP_PROXY).'
                )
            raise RuntimeError(f'Ошибка сети при обращении к YandexGPT: {reason}')
