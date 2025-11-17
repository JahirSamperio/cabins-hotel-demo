# 🚀 Deployment Guide - Hotel Cabañas

## 📋 Opciones de Despliegue

### **Recomendado para Producción:**
- **Frontend:** Vercel / Netlify
- **Backend:** Railway / Render / DigitalOcean
- **Base de Datos:** PostgreSQL en Neon / Supabase
- **Imágenes:** Cloudinary / AWS S3

---

## 🌐 Frontend Deployment

### **Opción 1: Vercel (Recomendado)**

#### **Preparación:**
```bash
# 1. Build del proyecto
cd frontend
npm run build

# 2. Verificar que funciona
npm run preview
```

#### **Configuración en Vercel:**
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### **Variables de Entorno:**
```env
VITE_API_URL=https://tu-backend.railway.app/api
VITE_APP_NAME=Cabañas Huasca
VITE_WHATSAPP_NUMBER=5215512345678
```

#### **Deploy:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Opción 2: Netlify**

#### **Configuración:**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Deploy:**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## ⚙️ Backend Deployment

### **Opción 1: Railway (Recomendado)**

#### **Preparación:**
```json
// package.json - Agregar scripts
{
  "scripts": {
    "start": "node src/index.js",
    "build": "echo 'No build needed'",
    "dev": "nodemon src/index.js"
  }
}
```

#### **Variables de Entorno en Railway:**
```env
NODE_ENV=production
PORT=3000
DB_HOST=tu-postgres-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASS=tu-password
JWT_SECRET=tu-jwt-secret-super-seguro
FRONTEND_URL=https://tu-frontend.vercel.app
```

#### **Deploy:**
```bash
# 1. Conectar repositorio en Railway
# 2. Configurar variables de entorno
# 3. Deploy automático desde GitHub
```

### **Opción 2: Render**

#### **Configuración:**
```yaml
# render.yaml
services:
  - type: web
    name: hotel-cabanas-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: hotel-cabanas-db
          property: connectionString
```

### **Opción 3: DigitalOcean App Platform**

#### **Configuración:**
```yaml
# .do/app.yaml
name: hotel-cabanas
services:
- name: api
  source_dir: backend
  github:
    repo: tu-usuario/hotel-cabanas
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
```

---

## 🗄️ Database Deployment

### **Opción 1: Neon (Recomendado)**

#### **Setup:**
1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nueva base de datos
3. Obtener connection string
4. Configurar en variables de entorno

#### **Connection String:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

#### **Migraciones:**
```bash
# Ejecutar migraciones en producción
npx sequelize-cli db:migrate --env production
```

### **Opción 2: Supabase**

#### **Setup:**
1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener credenciales de PostgreSQL
3. Configurar variables de entorno

#### **Configuración:**
```env
DB_HOST=db.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=tu-password
```

### **Opción 3: Railway PostgreSQL**

#### **Setup:**
```bash
# 1. Agregar PostgreSQL addon en Railway
# 2. Obtener variables de entorno automáticamente
# 3. Configurar en el servicio backend
```

---

## 🔧 Configuración de Producción

### **Backend - Configuración de CORS:**
```javascript
// src/config/cors.js
const corsOptions = {
  origin: [
    'https://tu-frontend.vercel.app',
    'https://tu-dominio.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173'] : [])
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

### **Configuración de Base de Datos:**
```javascript
// src/config/database.js
const config = {
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
}
```

### **Configuración de Seguridad:**
```javascript
// src/middlewares/security.js
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Helmet para headers de seguridad
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
})
app.use('/api', limiter)
```

---

## 📊 Monitoreo y Logs

### **Logging en Producción:**
```javascript
// src/utils/logger.js
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

### **Health Check Endpoint:**
```javascript
// src/routes/health.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})
```

### **Error Tracking:**
```javascript
// Integración con Sentry (opcional)
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

app.use(Sentry.Handlers.errorHandler())
```

---

## 🔐 SSL y Dominio Personalizado

### **Frontend (Vercel):**
```bash
# 1. Agregar dominio personalizado en Vercel
# 2. Configurar DNS records
# 3. SSL automático por Vercel
```

### **Backend (Railway):**
```bash
# 1. Agregar dominio personalizado en Railway
# 2. Configurar CNAME record
# 3. SSL automático por Railway
```

### **Configuración DNS:**
```
# Para frontend
CNAME www tu-app.vercel.app
A @ 76.76.19.61 (Vercel IP)

# Para backend
CNAME api tu-app.railway.app
```

---

## 📋 Checklist de Deployment

### **Pre-deployment:**
- [ ] ✅ Tests pasan localmente
- [ ] ✅ Build funciona sin errores
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos migrada
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ SSL habilitado

### **Post-deployment:**
- [ ] ✅ Health check responde
- [ ] ✅ Frontend carga correctamente
- [ ] ✅ API endpoints funcionan
- [ ] ✅ Base de datos conectada
- [ ] ✅ Autenticación funciona
- [ ] ✅ Reservas se pueden crear

### **Testing en Producción:**
- [ ] ✅ Registro de usuario
- [ ] ✅ Login/logout
- [ ] ✅ Crear reserva como invitado
- [ ] ✅ Panel de admin accesible
- [ ] ✅ Responsive en móvil
- [ ] ✅ Performance aceptable

---

## 🚨 Rollback Plan

### **Si algo sale mal:**

#### **Frontend:**
```bash
# Vercel - Rollback a deployment anterior
vercel --prod --force

# O desde dashboard de Vercel
# Ir a Deployments > Promote to Production
```

#### **Backend:**
```bash
# Railway - Rollback desde dashboard
# Ir a Deployments > Redeploy versión anterior

# O revertir commit en Git
git revert HEAD
git push origin main
```

#### **Base de Datos:**
```sql
-- Rollback de migración (si es necesario)
npx sequelize-cli db:migrate:undo --env production
```

---

## 📈 Optimizaciones de Producción

### **Frontend:**
```javascript
// vite.config.js - Optimizaciones de build
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['sweetalert2', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### **Backend:**
```javascript
// Compresión de respuestas
import compression from 'compression'
app.use(compression())

// Cache headers
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300') // 5 minutos
  }
  next()
})
```

---

## 🔄 CI/CD Pipeline (Opcional)

### **GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Guía completa de deployment