# 🤖 Telegram AI System

Un sistema completo de gestión de bots para Telegram y WhatsApp con inteligencia artificial, automatización de publicaciones, sincronización de grupos y control de usuarios.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Arquitectura](#flujo-de-arquitectura)
- [Módulos Principales](#módulos-principales)
- [Uso del Bot](#uso-del-bot)
- [API Endpoints](#api-endpoints)

---

## 📝 Descripción

**Telegram AI System** es una plataforma backend completa que actúa como un intermediario entre usuarios, bots de Telegram/WhatsApp e inteligencia artificial. Permite a los usuarios:

- ✅ Gestionar productos y publicaciones
- ✅ Sincronizar grupos de Telegram y WhatsApp
- ✅ Automatizar publicaciones programadas
- ✅ Implementar conversaciones con IA (Google Gemini)
- ✅ Controlar mensajeros y entregas
- ✅ Gestionar planes de suscripción

El sistema está diseñado con **sesiones independientes por usuario**, permitiendo múltiples usuarios conectando de forma simultánea sus cuentas de Telegram y WhatsApp.

---

## ✨ Características Principales

| Característica              | Descripción                                                  |
| --------------------------- | ------------------------------------------------------------ |
| 🤖 **Bot Telegram**         | Interfaz completa vía bot de Telegram con menús interactivos |
| 💬 **IA Integrada**         | Conversaciones con Google Gemini integradas                  |
| 📱 **WhatsApp Integration** | Conexión multi-sesión a WhatsApp Web                         |
| 📢 **Publicaciones**        | Automatizar posts en múltiples grupos                        |
| 📊 **Gestión de Productos** | ABM (Alta, Baja, Modificación) de productos                  |
| 👥 **Control de Usuarios**  | Admin panel para gestionar usuarios                          |
| 💳 **Sistema de Planes**    | FREE, DAILY, PRO con restricciones                           |
| 🔄 **Sincronización**       | Sync automático de grupos de Telegram/WhatsApp               |
| ⏱️ **Scheduler**            | Tareas programadas vía cron                                  |
| 🗄️ **Redis Cache**          | Caché distribuida para conversaciones                        |
| 🖼️ **MinIO Storage**        | Almacenamiento de imágenes                                   |

---

## 🔧 Tecnologías

**Backend:**

- **NestJS** - Framework Node.js progresivo
- **TypeScript** - Tipado estático
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **Redis** - Cache distribuida
- **MinIO** - Almacenamiento de objetos

**Integraciones:**

- **Telegram API** - Bot & User Bot
- **WhatsApp Web.js** - Conexión a WhatsApp
- **Google Generative AI** - Gemini para IA
- **Axios** - Cliente HTTP

**Herramientas:**

- **Docker** - Containerización
- **Jest** - Testing
- **ESLint** - Linting
- **Prettier** - Formateado de código

---

## 📦 Instalación

### Requisitos Previos

- **Node.js** ≥ 18.x
- **PostgreSQL** ≥ 12
- **Redis** ≥ 6
- **MinIO** (opcional, para almacenamiento)
- **Docker** (recomendado)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Alexeki3l/telegram-ai-system.git
cd telegram-ai-system/backend
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
TELEGRAM_ADMIN_ID=tu_admin_id
TELEGRAM_SUPER_ADMIN_ID=tu_super_admin_id

# AI & APIs
GEMINI_API_KEY=tu_gemini_key_aqui

# Telegram User Bot (Userbot)
API_ID=tu_api_id
API_HASH=tu_api_hash
PHONE_NUMBER=tu_numero_telefonico

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=telegram_ai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO (Almacenamiento)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Backend Config
BACKEND_API_KEY=tu_api_key
BACKEND_URL=http://backend:3000
NODE_ENV=development
```

### Paso 4: Ejecutar la Aplicación

**Modo desarrollo (con hot-reload):**

```bash
npm run start:dev
```

**Modo producción:**

```bash
npm run build
npm run start:prod
```

**Usando Docker Compose:**

```bash
docker-compose up -d
```

El servidor estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno Obligatorias

| Variable             | Descripción                        |
| -------------------- | ---------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram          |
| `TELEGRAM_ADMIN_ID`  | ID de Telegram del admin principal |
| `DATABASE_HOST`      | Host de PostgreSQL                 |
| `DATABASE_USER`      | Usuario de BD                      |
| `DATABASE_PASSWORD`  | Contraseña de BD                   |
| `REDIS_HOST`         | Host de Redis                      |

### Obtener Credenciales

**Telegram Bot Token:**

1. Habla con [@BotFather](https://t.me/botfather)
2. Usa `/newbot` y sigue las instrucciones
3. Copia el token generado

**Telegram Admin ID:**

1. Usa [@userinfobot](https://t.me/userinfobot)
2. Copia tu ID

**Gemini API Key:**

1. Ve a [Google AI Studio](https://aistudio.google.com)
2. Haz clic en "Create API Key"
3. Selecciona o crea un proyecto
4. Copia la key

**Telegram UserBot Credentials:**

1. Ve a [https://my.telegram.org/apps](https://my.telegram.org/apps)
2. Inicia sesión y obtén `API_ID` y `API_HASH`

---

## 📁 Estructura del Proyecto

```
telegram_ai_system/
├── backend/
│   ├── src/
│   │   ├── app.module.ts                 # Módulo raíz
│   │   ├── main.ts                       # Punto de entrada
│   │   │
│   │   ├── ai/                           # 🤖 Módulo de IA
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.interface.ts
│   │   │   ├── providers/
│   │   │   │   ├── gemini.provider.ts   # Google Gemini
│   │   │   │   └── ollama.provider.ts   # Ollama local
│   │   │   └── index.ts
│   │   │
│   │   ├── telegram-bot/                 # 💬 Bot de Telegram
│   │   │   ├── telegram-bot.module.ts
│   │   │   ├── telegram-bot.update.ts   # Manejador de acciones
│   │   │   ├── telegram-bot.service.ts
│   │   │   ├── telegram-bot.controller.ts
│   │   │   │
│   │   │   ├── handlers/                 # Lógica por dominio
│   │   │   │   ├── product.handler.ts   # Gestión de productos
│   │   │   │   ├── group.handler.ts     # Gestión de grupos
│   │   │   │   ├── publication.handler.ts # Publicaciones
│   │   │   │   ├── messenger.handler.ts  # Mensajeros
│   │   │   │   ├── settings.handler.ts   # Settings de usuario
│   │   │   │   ├── navigation.handler.ts # Menú principal
│   │   │   │   ├── config.handler.ts     # Config de conexiones
│   │   │   │   ├── plan.handler.ts       # Planes de suscripción
│   │   │   │   └── admin.handler.ts      # Admin panel
│   │   │   │
│   │   │   ├── services/                 # Servicios internos
│   │   │   │   ├── keyboard-builder.service.ts
│   │   │   │   ├── config-manager.service.ts
│   │   │   │   ├── state-manager.service.ts
│   │   │   │   ├── pagination.service.ts
│   │   │   │   └── bot-message.service.ts
│   │   │   │
│   │   │   ├── guards/                   # Guards de autorización
│   │   │   │   └── admin.guard.ts
│   │   │   │
│   │   │   ├── constants/
│   │   │   │   └── menu-options.constant.ts
│   │   │   │
│   │   │   └── interfaces/
│   │   │       └── bot-context.interface.ts
│   │   │
│   │   ├── products/                     # 📦 Módulo de Productos
│   │   │   ├── products.module.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── publication/                  # 📢 Módulo de Publicaciones
│   │   │   ├── publication.module.ts
│   │   │   ├── publication.service.ts
│   │   │   ├── publication.scheduler.ts  # Cron jobs
│   │   │   └── publication.controller.ts
│   │   │
│   │   ├── telegram-group/               # 🌎 Grupos Telegram
│   │   │   ├── telegram-group.module.ts
│   │   │   ├── telegram-group.service.ts
│   │   │   ├── telegram-group.controller.ts
│   │   │   └── dto/
│   │   │
│   │   ├── whatsapp/                     # 📱 Módulo WhatsApp
│   │   │   ├── whatsapp.module.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── whatsapp-connect.service.ts  # Multi-sesión
│   │   │   ├── whatsapp.scheduler.ts
│   │   │   ├── whatsapp.controller.ts
│   │   │   └── whatsapp-group.entity.ts
│   │   │
│   │   ├── whatsapp-group/               # WhatsApp Groups
│   │   │
│   │   ├── userbot/                      # 🔐 User Bot Telegram
│   │   │   ├── userbot.module.ts
│   │   │   ├── userbot-client.service.ts
│   │   │   ├── userbot-message.service.ts
│   │   │   ├── userbot.controller.ts
│   │   │   └── schedulers/
│   │   │
│   │   ├── users/                        # 👥 Gestión de Usuarios
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.controller.spec.ts
│   │   │   └── dto/
│   │   │
│   │   ├── plans/                        # 💳 Planes de Suscripción
│   │   │   ├── plans.module.ts
│   │   │   └── plans.service.ts
│   │   │
│   │   ├── transfers/                    # 💰 Transferencias
│   │   │   ├── transfers.module.ts
│   │   │   └── transfers.service.ts
│   │   │
│   │   ├── config/                       # ⚙️ Configuración
│   │   │   ├── config.module.ts
│   │   │   ├── config.service.ts
│   │   │   ├── config.controller.ts
│   │   │   └── database.config.ts
│   │   │
│   │   ├── images/                       # 🖼️ Almacenamiento MinIO
│   │   │   ├── images.module.ts
│   │   │   ├── images.service.ts
│   │   │   └── minio.providers.ts
│   │   │
│   │   ├── database/                     # 🗄️ Base de Datos
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── product.entity.ts
│   │   │   │   ├── publication.entity.ts
│   │   │   │   ├── telegram-group.entity.ts
│   │   │   │   ├── whatsapp-group.entity.ts
│   │   │   │   ├── plan.entity.ts
│   │   │   │   ├── user-plan.entity.ts
│   │   │   │   ├── config.entity.ts
│   │   │   │   └── transfer.entity.ts
│   │   │   └── index.ts
│   │   │
│   │   └── commons/
│   │       └── interfaces/
│   │           ├── file-type.interface.ts
│   │           └── product-caption.interface.ts
│   │
│   ├── test/                             # Tests
│   │   └── jest-e2e.json
│   │
│   ├── .env.example                      # Variables de entorno ejemplo
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── README.md
```

---

## 🏗️ Flujo de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT USERS                        │
└────────────────────────┬────────────────────────────────────┘
                         │ /start, callbacks
                         ▼
        ┌────────────────────────────────┐
        │   TELEGRAM BOT MODULE           │
        │ (telegram-bot.update.ts)        │
        │  - Orquestador de acciones      │
        │  - Maneja callbacks             │
        └────────┬─────────────────────────┘
                 │
        ┌────────▼─────────────────────────┐
        │        HANDLERS (Dominios)       │
        ├──────────────────────────────────┤
        │ ▪ ProductHandler                 │
        │ ▪ GroupHandler                   │
        │ ▪ PublicationHandler             │
        │ ▪ SettingsHandler                │
        │ ▪ ConfigHandler                  │
        │ ▪ NavigationHandler              │
        │ ▪ AdminHandler                   │
        └────────┬──────────────────────────┘
                 │
    ┌────────────┼────────────────────────────────┐
    │            │                                │
    ▼            ▼                                ▼
PRODUCTS    PUBLICATIONS              USERS/PLANS
 MODULE       MODULE                   MODULES
    │            │                        │
    ▼            ▼                        ▼
 ┌─────┬─────────────────┬────────────────────┐
 │ PostgreSQL DATABASE    │ Redis (Cache)      │
 ├────────────────────────┼────────────────────┤
 │ • products             │ • Conversations    │
 │ • publications         │ • Sessions         │
 │ • users                │ • Temp states      │
 │ • telegram_groups      │                    │
 │ • whatsapp_groups      │                    │
 │ • configs              │                    │
 │ • plans                │                    │
 └─────────────────────────┴────────────────────┘

┌─────────────────────────────────────────────────┐
│  EXTERNAL INTEGRATIONS                          │
├─────────────────────────────────────────────────┤
│ Google Gemini API ──────► AI Conversations      │
│ Telegram User Bot ──────► Sync grupos           │
│ WhatsApp Web.js ───────► Multi-session users    │
│ MinIO ─────────────────► Image Storage          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  SCHEDULERS (Cron Jobs)                         │
├─────────────────────────────────────────────────┤
│ • PublicationScheduler    → Publicar en grupos  │
│ • WhatsAppScheduler       → Sync grupos WA      │
│ • ConfigRefreshScheduler  → Refresh configs     │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Módulos Principales

### 🤖 AI Module (`/ai`)

Gestiona integraciones con IA:

- **GeminiProvider**: Conversaciones con Google Gemini
- **OllamaProvider**: Modelos locales (opcional)

**Archivos clave:**

- `ai.provider.ts` - Interfaz de IA
- `gemini.provider.ts` - Implementación Gemini

---

### 💬 Telegram Bot Module (`/telegram-bot`)

Sistema completo del bot de Telegram:

**Handlers (Controladores de lógica):**

- `product.handler.ts` - CRUD de productos
- `group.handler.ts` - Gestión de grupos Telegram
- `publication.handler.ts` - Crear/editar publicaciones
- `settings.handler.ts` - Configuración de usuario
- `config.handler.ts` - Conexiones (WhatsApp, Telegram)
- `navigation.handler.ts` - Menú principal
- `admin.handler.ts` - Panel de admin

**Servicios:**

- `keyboard-builder.service.ts` - Construye teclados inline
- `config-manager.service.ts` - Gestiona config del usuario
- `state-manager.service.ts` - Estado temporal del usuario

---

### 📦 Products Module (`/products`)

Gestión de productos del usuario:

- Crear, editar, eliminar productos
- Filtrar por usuario
- Asociar a publicaciones

**Archivos:**

- `products.service.ts` - Lógica CRUD
- `products.controller.ts` - Endpoints REST

---

### 📢 Publication Module (`/publication`)

Automatización de publicaciones en grupos:

- Crear publicaciones con productos
- Seleccionar grupos destino
- Sincronizar con Telegram/WhatsApp
- **PublicationScheduler**: Ejecuta publicaciones en horarios

**Archivos:**

- `publication.service.ts` - Lógica
- `publication.scheduler.ts` - Tareas cron

---

### 📱 WhatsApp Module (`/whatsapp`)

Integración multi-sesión con WhatsApp Web:

- Una sesión independiente por usuario
- Escanear QR para conectar
- Sincronizar grupos
- Enviar mensajes/imágenes

**Archivos clave:**

- `whatsapp-connect.service.ts` - Gestiona sesiones (Map<telegramId, UserSession>)
- `whatsapp.service.ts` - Persistencia en BD
- `whatsapp.scheduler.ts` - Sync automático

---

### 👥 Users Module (`/users`)

Gestión de usuarios:

- Registro automático en `/start`
- Autenticación por Telegram ID
- Asignar planes FREE/DAILY/PRO
- Verificar credenciales

---

### 💳 Plans Module (`/plans`)

Gestión de suscripciones:

- Planes: FREE, DAILY, PRO
- Restricciones por plan
- Asignar plan al usuario
- Verificar vigencia

---

### ⚙️ Config Module (`/config`)

Configuración por usuario:

- Publicar en grupos (ON/OFF)
- Conversación con IA (ON/OFF)
- Intervalo de publicación
- Intervalo de sync

---

## 🔄 Flujo de Uso Típico

```
1. Usuario obtiene Bot Token
   ↓
2. Usuario hace /start en Telegram
   ↓
3. NavigationHandler:
   - Crea usuario en BD (si no existe)
   - Asigna plan FREE (si no tiene)
   - Muestra menú principal
   ↓
4. Usuario selecciona "Productos"
   ↓
5. ProductHandler:
   - Lista productos del usuario
   - Permite crear/editar
   - Guarda en BD
   ↓
6. Usuario selecciona "Publicaciones"
   ↓
7. PublicationHandler:
   - Selecciona productos
   - Selecciona grupos destino
   - Crea publicación
   - Scheduler ejecuta en horario programado
   ↓
8. PublicationScheduler:
   - Obtiene publicaciones activas
   - Envía a Telegram groups (vía User Bot)
   - Envía a WhatsApp groups (vía web.js)
```

---

## 🔐 Autenticación y Permisos

| Rol                | Acceso                            | Env Var                   |
| ------------------ | --------------------------------- | ------------------------- |
| **Usuario Normal** | Bot básico, ver planes            | (cualquiera)              |
| **Admin**          | Gestión de usuarios, estadísticas | `TELEGRAM_ADMIN_ID`       |
| **Super Admin**    | Todo + Transferencias             | `TELEGRAM_SUPER_ADMIN_ID` |

---

## 📡 API Endpoints Principales

### 🔓 Públicos (sin autenticación)

```
GET    /api/health                    - Estado del servidor
```

### 👥 Usuarios

```
GET    /users                         - Listar todos
GET    /users/:id                     - Obtener uno
POST   /users                         - Crear
PATCH  /users/:id                     - Actualizar
DELETE /users/:id                     - Eliminar
```

### 📦 Productos

```
GET    /products                      - Listar
POST   /products                      - Crear
PATCH  /products/:id                  - Actualizar
DELETE /products/:id                  - Eliminar
```

### 📢 Publicaciones

```
GET    /publications                  - Listar
POST   /publications                  - Crear
PATCH  /publications/:id              - Actualizar
DELETE /publications/:id              - Eliminar
```

### 📱 WhatsApp

```
GET    /whatsapp/status?telegramId=x  - Estado conexión
GET    /whatsapp/groups?telegramId=x  - Listar grupos
POST   /whatsapp/send                 - Enviar mensaje
POST   /whatsapp/send-image           - Enviar imagen
```

---

## 📊 Base de Datos - Entidades Clave

```sql
-- Usuarios
users {
  id (UUID primary key)
  telegramId (unique)
  username, firstName
  telegramApiId, telegramApiHash
  isActive, hasPlan
  createdAt, updatedAt
}

-- Productos
products {
  id (UUID)
  userId (foreign key → users)
  name, description, price
  imageUrl, available
  createdAt
}

-- Publicaciones
publications {
  id (UUID)
  userId (foreign key)
  name, description
  telegramGroupIds[] (JSON array)
  whatsappGroupIds[] (JSON array)
  active, createdAt
}

-- Planes
plans {
  id (UUID)
  type (FREE, DAILY, PRO)
  durationDays, maxGroups
  publicationsPerDay
}

-- Configuración (por usuario)
config {
  id (UUID)
  userId (foreign key)
  publishEnabled, publishInterval
  syncGroupsEnable, syncInterval
  conversationWithAI, deliveriesEnable
}

-- Grupos Telegram
telegram_groups {
  id (UUID)
  userId (foreign key)
  telegramGroupId, title
  description, createdAt
}

-- Grupos WhatsApp
whatsapp_groups {
  id (UUID)
  userId (foreign key)
  whatsappGroupId, title
  createdAt
}
```

---

## 🐛 Troubleshooting

### Problema: "Unable to connect to the database"

**Solución:** Verificar que PostgreSQL esté corriendo y las credenciales sean correctas en `.env`

### Problema: "Redis connection error"

**Solución:** Verificar que Redis esté corriendo en `localhost:6379`

### Problema: "WhatsApp QR no aparece"

**Solución:** Verificar que `TELEGRAM_BOT_TOKEN` sea válido

### Problema: "Conversación con IA no funciona"

**Solución:** Verificar que `GEMINI_API_KEY` sea válido en Google AI Studio

---

## 📚 Recursos Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [Telegraf Documentation](https://telegraf.js.org)
- [TypeORM Documentation](https://typeorm.io)
- [Google Generative AI](https://ai.google.dev)
- [Telegram Bot API](https://core.telegram.org/bots)
- [WhatsApp Web.js](https://docs.wwebjs.dev)

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev      # Hot reload
npm run lint           # Linting con ESLint
npm run format         # Formatear con Prettier
npm test               # Correr tests

# Producción
npm run build          # Compilar TypeScript
npm run start:prod     # Ejecutar en producción

# Debug
npm run start:debug    # Debug mode
npm run test:cov       # Coverage de tests
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama `feature/nueva-caracteristica`
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia **UNLICENSED**

---

## 👤 Autor

**Alexeki3l** - Backend Developer

---

## 📞 Contacto y Soporte

Para reportar bugs o sugerencias, abre un issue en GitHub.

---

**Última actualización:** Abril 2026  
**Versión:** 1.0.0
