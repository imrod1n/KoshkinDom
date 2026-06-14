# Кошкин Дом — веб-сервис для любителей кошек

Дипломный проект: социальная сеть с тематическими разделами, форумом, календарём мероприятий, ИИ-помощником и напоминаниями о здоровье питомцев.

## Стек технологий

| Слой | Технологии |
|------|------------|
| Backend | **Django 5**, DRF, JWT, **PostgresSQL**, **Django Channels** (WebSocket) |
| Frontend | **React** (Vite), **Bootstrap 5**, **Draft.js** |
| API | REST, JSON |

## Реализованный функционал

### Социальная сеть
- Регистрация, JWT-авторизация, личные профили
- Лента с форматированием (жирный, курсив, заголовки, списки) и загрузкой фото
- **Лайки** ❤️, комментарии, репосты
- Подписки на пользователей
- Личные сообщения и **чаты в реальном времени (WebSocket)**
- Тематические сообщества (вступление / выход)

### Специализированные модули
- **Разделы:** породы, уход, здоровье, питание, воспитание + редактор статей с выбором раздела
- **Форум:** темы, вопросы экспертам, отметка экспертного ответа
- **Календарь:** выставки, встречи владельцев, запись на событие
- **ИИ-помощник:** ответы по базе знаний (вакцинация, паразиты, питание и др.)
- **Напоминания:** питомцы, вакцинация, обработка от паразитов

## Структура проекта

```
diplom/
├── backend/          # Django API
│   ├── accounts/     # пользователи, подписки
│   ├── posts/        # лента, лайки, комментарии, репосты
│   ├── messaging/    # чаты + WebSocket
│   ├── communities/  # сообщества
│   ├── sections/     # тематические разделы
│   ├── forum/        # форум
│   ├── events/       # мероприятия
│   ├── ai_assistant/ # ИИ-помощник
│   └── reminders/    # напоминания
└── frontend/         # React SPA
```

## Запуск

### 1. Backend

```bash
sudo apt install python3-venv python3-pip default-libmysqlclient-dev mariadb-server

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  
python manage.py migrate
python manage.py seed_sections
python manage.py createsuperuser
daphne -b 127.0.0.1 -p 8000 config.asgi:application
```

API: `http://127.0.0.1:8000/api/`  
Админка: `http://127.0.0.1:8000/admin/`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Приложение: `http://127.0.0.1:5173`

## Основные API-эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/token/` | Вход (JWT) |
| POST | `/api/accounts/register/` | Регистрация |
| GET/POST | `/api/posts/` | Лента |
| POST | `/api/posts/{id}/like/` | Лайк |
| WS | `/ws/chat/{id}/?token=JWT` | Чат в реальном времени |
| GET/POST | `/api/messaging/conversations/` | Чаты |
| GET | `/api/sections/` | Разделы |
| GET/POST | `/api/forum/topics/` | Форум |
| GET/POST | `/api/events/` | События |
| POST | `/api/ai/ask/` | Вопрос ИИ |
| GET/POST | `/api/reminders/pets/` | Питомцы и напоминания |

## Для пояснительной записки

- **Предметная область:** сообщество владельцев кошек.
- **Архитектура:** клиент-сервер, SPA + REST API.
- **Безопасность:** JWT, разграничение прав, CORS.
- **ИИ-модуль:** rule-based поиск по ключевым словам (расширяемо до LLM API).

### Ошибка `no such table: sections_section`

Таблицы приложений не созданы. Выполните `python manage.py migrate`.

Если появляется `InconsistentMigrationHistory` (БД создавалась до `accounts.User`), удалите `db.sqlite3` и снова выполните `migrate` и `seed_sections`.

### `python manage.py check --deploy`

**Локальная разработка** (`.env` с `DJANGO_DEBUG=True`) — предупреждения **нормальны**. Для повседневной работы достаточно:

```bash
python manage.py check
```

**Проверка перед сдачей/деплоем** — используйте production-конфиг:

```bash
cp .env.production.example .env.production
# отредактируйте DJANGO_SECRET_KEY и домен
chmod +x scripts/check_deploy.sh
./scripts/check_deploy.sh
```

Ожидаемый результат: `System check identified no issues`.

В `.env` для разработки уже задан надёжный `DJANGO_SECRET_KEY` (исправляет предупреждение W009).
