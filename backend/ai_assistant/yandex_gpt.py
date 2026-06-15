import logging
import os
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# Configuration
YANDEX_API_KEY = os.getenv('YANDEX_API_KEY') or os.getenv('YANDEX_IAM_TOKEN')
YANDEX_GPT_MODEL = os.getenv('YANDEX_GPT_MODEL', 'gpt://b1gtun08c2i8n7n9qmlf/yandexgpt-lite')
YANDEX_API_URL = os.getenv('YANDEX_API_URL', 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion')

# Request defaults
DEFAULT_TEMPERATURE = 0.6
DEFAULT_MAX_TOKENS = 2000

# Cat-related keywords for validation
CAT_KEYWORDS = {
    'кот', 'кота', 'коте', 'кошка', 'кошки', 'кошек', 'кошке', 'котов', 'котам', 'котами',
    'котёнок', 'котенок', 'котёнка', 'котенка', 'котята', 'котят',
    'мурлыка', 'мурлычет', 'мяукает', 'мяу', 'мяуканье',
    'лапа', 'лапы', 'лапки', 'когти', 'коготь',
    'усы', 'усик', 'усики', 'хвост', 'хвоста', 'хвостом',
    'шерсть', 'шерстка', 'шерстью', 'мех', 'меха', 'мехом',
    'породы', 'порода', 'кошачий', 'кошачья', 'кошачье', 'кошачьих',
    'питание', 'кормить', 'корм', 'еда', 'еды',
    'здоровье', 'болезнь', 'ветеринар', 'ветеринара', 'доктор',
    'прививка', 'вакцина', 'лечение',
    'лоток', 'наполнитель', 'туалет',
    'поведение', 'характер', 'привычки', 'игра', 'игры', 'игрушки',
    'дрессировка', 'воспитание', 'обучение',
    'беременность', 'роды', 'котята',
    'grooming', 'груминг', 'триминг',
}


class YandexGPTClient:
    """Client for Yandex Foundation Models API."""

    def __init__(self, api_key: Optional[str] = None, model_uri: Optional[str] = None, api_url: Optional[str] = None):
        """
        Initialize Yandex GPT client.

        Args:
            api_key: API key for authentication (defaults to YANDEX_API_KEY env)
            model_uri: Model URI (defaults to YANDEX_GPT_MODEL env)
            api_url: API endpoint URL (defaults to YANDEX_API_URL env)
        """
        self.api_key = api_key or YANDEX_API_KEY
        self.model_uri = model_uri or YANDEX_GPT_MODEL
        self.api_url = api_url or YANDEX_API_URL

        if not self.api_key:
            raise RuntimeError(
                'YandexGPT API key not configured. '
                'Set YANDEX_API_KEY or YANDEX_IAM_TOKEN environment variable.'
            )

        # Create session with proxy support
        self.session = requests.Session()
        self.session.trust_env = True
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Api-Key {self.api_key}',
        }

    def _is_cat_related(self, question: str) -> bool:
        """Check if question is related to cats."""
        q = question.lower()
        return any(keyword in q for keyword in CAT_KEYWORDS)

    def _build_request_payload(
        self,
        question: str,
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ) -> dict:
        """Build request payload for Yandex API."""
        return {
            'modelUri': self.model_uri,
            'completionOptions': {
                'stream': False,
                'temperature': temperature,
                'maxTokens': str(max_tokens),
            },
            'messages': [
                {
                    'role': 'user',
                    'text': question,
                }
            ],
        }

    def _parse_response(self, response_data: dict) -> str:
        """Parse Yandex API response and extract text."""
        try:
            # Navigate through response structure
            result = response_data.get('result', {})
            alternatives = result.get('alternatives', [])

            if not alternatives:
                raise ValueError('No alternatives in response')

            # Take first alternative
            first_alt = alternatives[0]
            message = first_alt.get('message', {})
            text = message.get('text', '').strip()

            if not text:
                raise ValueError('Empty text in response')

            return text

        except (KeyError, IndexError, ValueError) as exc:
            logger.error(f'Failed to parse Yandex response: {exc}')
            logger.debug(f'Raw response: {response_data}')
            raise ValueError(f'Cannot parse Yandex GPT response: {exc}')

    def generate_answer(
        self,
        question: str,
        temperature: float = DEFAULT_TEMPERATURE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
    ) -> str:
        """
        Generate answer using Yandex GPT.

        Args:
            question: User question
            temperature: Temperature for generation (0.0-1.0)
            max_tokens: Maximum tokens in response

        Returns:
            Generated text answer

        Raises:
            RuntimeError: On network or API errors
            ValueError: On response parsing errors or non-cat question
        """
        # Validate that question is about cats
        if not self._is_cat_related(question):
            raise ValueError(
                'Вопрос не относится к кошкам. '
                'Я помогаю только с вопросами о кошках и их уходе. '
                'Пожалуйста, задайте вопрос о кошках.'
            )

        payload = self._build_request_payload(question, temperature, max_tokens)

        try:
            logger.debug(f'Sending request to {self.api_url}')
            response = self.session.post(
                self.api_url,
                json=payload,
                headers=self.headers,
                timeout=30,
            )
            response.raise_for_status()

            data = response.json()
            logger.debug(f'Received response: {data}')

            return self._parse_response(data)

        except requests.exceptions.Timeout:
            msg = 'Yandex API request timed out (30s)'
            logger.error(msg)
            raise RuntimeError(msg)

        except requests.exceptions.ConnectionError as exc:
            # Check for DNS resolution errors
            if 'Name or service not known' in str(exc) or 'Failed to resolve' in str(exc):
                msg = (
                    f'Cannot resolve Yandex API host. Check DNS or proxy settings. '
                    f'Error: {exc}'
                )
            else:
                msg = f'Connection error to Yandex API: {exc}'
            logger.error(msg)
            raise RuntimeError(msg)

        except requests.exceptions.HTTPError as exc:
            msg = f'Yandex API error: {exc.response.status_code} {exc.response.reason}'
            try:
                error_data = exc.response.json()
                logger.error(f'{msg}. Response: {error_data}')
            except Exception:
                logger.error(f'{msg}. Response: {exc.response.text}')
            raise RuntimeError(msg)

        except requests.exceptions.RequestException as exc:
            msg = f'Request error: {exc}'
            logger.error(msg)
            raise RuntimeError(msg)


# Global client instance
_client: Optional[YandexGPTClient] = None


def get_client() -> YandexGPTClient:
    """Get or create global Yandex GPT client."""
    global _client
    if _client is None:
        _client = YandexGPTClient()
    return _client


def is_yandex_configured() -> bool:
    """Check if Yandex GPT is configured."""
    return bool(YANDEX_API_KEY)


def generate_yandex_answer(question: str) -> str:
    """
    Generate answer using Yandex GPT.

    Args:
        question: User question

    Returns:
        Generated answer text

    Raises:
        RuntimeError: On configuration or API errors
    """
    if not is_yandex_configured():
        raise RuntimeError(
            'YandexGPT not configured. Set YANDEX_API_KEY or YANDEX_IAM_TOKEN environment variable.'
        )

    client = get_client()
    return client.generate_answer(question)
