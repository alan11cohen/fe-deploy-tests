# Despliegue en Vercel

## Frontend (Next.js)

### 1. Configurar en Vercel Dashboard

1. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio de GitHub
2. Selecciona el directorio `order-pay-end-user-app/order-pay-end-user-app/`
3. Configura las siguientes variables de entorno:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
```

### 2. Variables de Entorno Requeridas

- `NEXT_PUBLIC_API_BASE_URL`: URL del backend desplegado en Railway

### 3. Comandos de Build

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Backend (NestJS)

### 1. Desplegar en Railway

1. Ve a [railway.app](https://railway.app) y conecta tu repositorio
2. Selecciona el directorio `order-pay-backend/order-pay-backend/`
3. Railway detectará automáticamente el Dockerfile

### 2. Variables de Entorno Requeridas

```
# Database
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT
JWT_SECRET=your-jwt-secret

# Firebase Admin SDK
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=order-and-pay-b193c
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
USE_FIREBASE=true

# CORS
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### 3. Base de Datos

- Usar Railway PostgreSQL o MySQL
- O conectar una base de datos externa (PlanetScale, Supabase, etc.)

## Pasos para Desplegar

1. **Desplegar Backend primero**:

   - Subir a Railway
   - Configurar variables de entorno
   - Obtener la URL del backend

2. **Actualizar Frontend**:

   - Actualizar `NEXT_PUBLIC_API_BASE_URL` con la URL del backend
   - Desplegar en Vercel

3. **Verificar**:
   - Probar endpoints del backend
   - Probar funcionalidad del frontend
   - Verificar CORS y autenticación
