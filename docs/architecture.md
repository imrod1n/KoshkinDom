# Архитектура веб-сервиса «Кошкин Дом»

## Диаграмма классов (основные сущности)

Компактная группировка по доменам — элементы расположены ближе друг к другу.

```mermaid
classDiagram
    direction LR

  namespace accounts {
    class User {
      +username
      +email
      +avatar
      +bio
    }
  }

  namespace posts {
    class Post {
      +content_raw
      +content_text
      +image
    }
    class Like
    class Comment {
      +text
    }
  }

  namespace messaging {
    class Conversation {
      +is_group
      +title
    }
    class Message {
      +text
      +is_read
    }
  }

  namespace communities {
    class Community {
      +name
      +slug
    }
  }

  namespace sections {
    class Section {
      +category
      +title
    }
    class Article {
      +title
      +content_raw
    }
  }

  namespace reminders {
    class Pet {
      +name
      +breed
    }
    class Reminder {
      +reminder_type
      +due_date
    }
  }

  User "1" --> "*" Post : author
  User "1" --> "*" Like
  Post "1" --> "*" Like
  Post "1" --> "*" Comment
  User "1" --> "*" Comment

  User "*" --> "*" Conversation
  Conversation "1" --> "*" Message
  User "1" --> "*" Message : sender

  User "1" --> "*" Community : owner
  Community "1" --> "1" Conversation
  Community "*" --> "*" User : members

  Section "1" --> "*" Article
  User "1" --> "*" Article

  User "1" --> "*" Pet
  Pet "1" --> "*" Reminder
```

### Альтернатива — одна плотная схема (все классы в ряд)

Если нужна ещё более компактная картинка без разделения на блоки:

```mermaid
classDiagram
    direction LR

    class User
    class Post
    class Like
    class Comment
    class Conversation
    class Message
    class Community
    class Section
    class Article
    class Pet
    class Reminder

    User --> Post
    User --> Like
    Post --> Like
    Post --> Comment
    User --> Comment
    User --> Conversation
    Conversation --> Message
    User --> Message
    User --> Community
    Community --> Conversation
    Community --> User
    Section --> Article
    User --> Article
    User --> Pet
    Pet --> Reminder
```
