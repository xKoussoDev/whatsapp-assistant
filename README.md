# WhatsApp Personal Assistant 24/7 🤖

Asistente personal inteligente para WhatsApp con procesamiento de lenguaje natural, gestión de tareas y recordatorios automáticos.

## 🚀 Características

- 📝 **Gestión de tareas** con lenguaje natural
- ⏰ **Recordatorios automáticos** programados
- 🧠 **NLP integrado** para entender comandos en español
- 📊 **API REST** completamente documentada
- 🔐 **Autenticación JWT** segura
- 📱 **Integración oficial** con WhatsApp Cloud API
- 🌐 **Deploy 24/7** listo para Railway/Render
- 📈 **Base de datos dual** SQLite/PostgreSQL



## 📋 Requisitos

- Node.js 18+
- Cuenta de Meta for Developers
- WhatsApp Business API configurada
- PostgreSQL (producción) o SQLite (desarrollo)



## 🔧 Instalación Local

1. Clonar el repositorio
git clone https://github.com/xKoussoDev/whatsapp-assistant.git
cd whatsapp-assistant

2. Instalar dependencias
bashnpm install

3. Configurar variables de entorno
bashcp .env.example .env
# Editar .env con tus credenciales

4. Ejecutar migraciones
bashnpm run migrate

5. Cargar datos de prueba (opcional)
bashnpm run seed

6. Iniciar servidor de desarrollo
bashnpm run dev



## 🚀 Deploy en Railway

1. Fork este repositorio

2. Crear nuevo proyecto en Railway
    - Conectar con GitHub
    - Seleccionar el repositorio

3. Configurar variables de entorno
   - DATABASE_URL → Proporcionada por Railway
   - JWT_SECRET → Generar una clave segura
   - WHATSAPP_VERIFY_TOKEN → Tu token de verificación
   - WHATSAPP_ACCESS_TOKEN → Token de acceso de Meta
   - WHATSAPP_PHONE_NUMBER_ID → ID del número de WhatsApp
   - APP_BASE_URL → https://tu-app.railway.app

4. Deploy automático
    - Railway detectará el Procfile
    - Ejecutará migraciones automáticamente
    - Servidor iniciará en puerto 8080



## 📱 Configuración de WhatsApp

1. Acceder a Meta for Developers
    - https://developers.facebook.com

2. Crear app de WhatsApp Business
    - Tipo: Business
    - Agregar producto WhatsApp

3. Configurar webhook
    - URL: https://tu-app.railway.app/webhook/whatsapp
    - Token de verificación: El mismo en .env
    - Campos: messages

4. Obtener tokens
    - Access Token temporal o permanente
    - Phone Number ID del número de prueba



## 💬 Comandos Soportados

**Crear tareas**
"Recuérdame estudiar IA mañana a las 6pm"
"Tengo que comprar leche urgente"
"Agregar tarea revisar correos"

**Ver tareas**
"Lista mis tareas"
"Qué tengo pendiente hoy"
"Mostrar tareas"

**Completar tareas**
"Completar 1"
"Marca como hecha la 2"
"Ya terminé la tarea 3"

**Eliminar tareas**
"Borrar tarea 1"
"Eliminar la 2"
"Quitar tarea 3"

**Ayuda**
"Ayuda"
"Qué puedes hacer"
"Comandos"



## 📊 API Endpoints
La documentación completa está disponible en /docs

**Autenticación**
POST /api/auth/register - Registrar usuario
POST /api/auth/login - Iniciar sesión

**Tareas (requiere JWT)**
POST /api/tasks - Crear tarea
GET /api/tasks - Listar tareas
GET /api/tasks/:id - Ver tarea
PATCH /api/tasks/:id - Actualizar tarea
DELETE /api/tasks/:id - Eliminar tarea

**Recordatorios (requiere JWT)**
POST /api/reminders - Crear recordatorio
GET /api/reminders - Listar recordatorios
DELETE /api/reminders/:id - Eliminar recordatorio



## 🧪 Testing

**Ejecutar todas las pruebas**
npm test

**Pruebas con watch**
npm run test:watch

**Coverage**
npm run test:coverage



## 📝 Estructura del Proyecto
src/
├── config/        # Configuración
├── models/        # Modelos de datos
├── nlp/          # Procesamiento de lenguaje
├── services/     # Lógica de negocio
├── controllers/  # Controladores HTTP
├── routes/       # Rutas API
├── middleware/   # Middlewares
├── jobs/         # Tareas programadas
└── docs/         # Documentación Swagger



## 🔒 Seguridad
Autenticación JWT
Rate limiting configurado
Helmet para headers seguros
Validación con Joi
Sanitización de entradas



## 📈 Monitoreo
Health check en /health
Logs estructurados con Winston
Auto-ping para mantener servicio activo



## 🤝 Contribuir
Fork el proyecto
Crear rama de feature (git checkout -b feature/AmazingFeature)
Commit cambios (git commit -m 'Add AmazingFeature')
Push a la rama (git push origin feature/AmazingFeature)
Abrir Pull Request

## 📄 Licencia
MIT License - ver LICENSE para detalles

## 👨‍💻 Autor
Pablo Cisneros - @xKoussoDev

## 🙏 Agradecimientos
Meta WhatsApp Cloud API
Comunidad Open Source


⭐ Si te gusta el proyecto, dale una estrella en GitHub!