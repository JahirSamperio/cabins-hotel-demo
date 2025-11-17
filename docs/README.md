# 📚 Documentación - Hotel Cabañas Huasca

## 🎯 Descripción del Proyecto

Sistema completo de gestión hotelera para cabañas en Huasca de Ocampo, Hidalgo. Incluye frontend público para reservas, panel de administración completo y sistema de reservas para invitados.

## 🏗️ Arquitectura General

### **Stack Tecnológico:**
- **Frontend:** React 18 + Vite + React Router
- **Backend:** Node.js + Express + Sequelize
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT
- **UI/UX:** CSS personalizado + SweetAlert2
- **Iconos:** Lucide React

### **Estructura del Proyecto:**
```
PP-hotelCabanas/
├── frontend/          # Aplicación React
├── backend/           # API Node.js
├── docs/             # Documentación
└── README.md         # Este archivo
```

## 🚀 Estado Actual del Desarrollo

### ✅ **Funcionalidades Completadas:**

#### **Frontend Público:**
- ✅ Landing page completa con todas las secciones
- ✅ Sistema de navegación entre páginas
- ✅ Lista de cabañas con filtros
- ✅ Detalles individuales de cabañas
- ✅ Sistema de reservas para invitados
- ✅ Formularios con validaciones robustas
- ✅ Integración con SweetAlert2
- ✅ Diseño responsive completo

#### **Panel de Administración:**
- ✅ Dashboard con métricas
- ✅ Gestión completa de cabañas (CRUD)
- ✅ Gestión de reservaciones
- ✅ Agenda/calendario de ocupación
- ✅ Sistema de pagos y estados
- ✅ Gestión de disponibilidad
- ✅ Exportación de datos
- ✅ Contacto por WhatsApp integrado

#### **Backend API:**
- ✅ Autenticación JWT completa
- ✅ CRUD completo de cabañas
- ✅ Sistema de reservaciones
- ✅ Gestión de usuarios
- ✅ API para invitados (sin auth)
- ✅ Validaciones robustas
- ✅ Manejo de errores

## 📋 Documentos Disponibles

1. **[Arquitectura del Sistema](./ARQUITECTURA.md)** - Estructura técnica completa
2. **[Sistema de Reservas](./SISTEMA_RESERVAS_INVITADOS.md)** - Implementación de reservas para invitados
3. **[API Documentation](./API.md)** - Documentación completa de endpoints
4. **[Base de Datos](./DATABASE.md)** - Esquema y modelos de datos
5. **[Frontend Components](./FRONTEND.md)** - Componentes y páginas
6. **[Deployment Guide](./DEPLOYMENT.md)** - Guía de despliegue
7. **[Troubleshooting](./TROUBLESHOOTING.md)** - Solución de problemas comunes

## 🎯 Próximos Pasos Sugeridos

### **Funcionalidades Pendientes:**
- [ ] Sistema de confirmación por email
- [ ] Integración con pasarelas de pago
- [ ] Notificaciones automáticas
- [ ] Sistema de reviews
- [ ] PWA (Progressive Web App)
- [ ] Optimización SEO avanzada

### **Mejoras Técnicas:**
- [ ] Tests unitarios y de integración
- [ ] CI/CD pipeline
- [ ] Monitoreo y logging
- [ ] Cache Redis
- [ ] CDN para imágenes
- [ ] Backup automático

## 🛠️ Comandos de Desarrollo

### **Frontend:**
```bash
cd frontend
npm install
npm run dev          # Desarrollo
npm run build        # Producción
npm run preview      # Preview build
```

### **Backend:**
```bash
cd backend
npm install
npm run dev          # Desarrollo con nodemon
npm start            # Producción
```

## 🌐 URLs del Sistema

### **Frontend:**
- **Desarrollo:** http://localhost:5173
- **Homepage:** `/`
- **Cabañas:** `/cabanas`
- **Reservar:** `/reservar`
- **Admin:** `/admin`
- **Login:** `/login`

### **Backend:**
- **Desarrollo:** http://localhost:3000
- **API Base:** `/api`
- **Documentación:** `/api/docs` (si está implementada)

## 👥 Roles de Usuario

### **Invitado (Sin registro):**
- ✅ Ver cabañas y detalles
- ✅ Crear reservas
- ✅ Contactar por WhatsApp

### **Usuario Registrado:**
- ✅ Todo lo de invitado
- ✅ Dashboard personal
- ✅ Historial de reservas
- ✅ Gestión de perfil

### **Administrador:**
- ✅ Panel completo de administración
- ✅ Gestión de cabañas
- ✅ Gestión de reservas
- ✅ Reportes y métricas
- ✅ Configuración del sistema

## 📊 Métricas del Proyecto

### **Líneas de Código (Aproximado):**
- **Frontend:** ~15,000 líneas
- **Backend:** ~8,000 líneas
- **Total:** ~23,000 líneas

### **Archivos Principales:**
- **Componentes React:** 25+
- **Páginas:** 8
- **Endpoints API:** 30+
- **Modelos de BD:** 5

## 🔧 Configuración del Entorno

### **Variables de Entorno Requeridas:**

#### **Backend (.env):**
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_cabanas
DB_USER=postgres
DB_PASS=password
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

#### **Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Cabañas Huasca
```

## 📞 Contacto y Soporte

Para dudas sobre el desarrollo o implementación:
- **Documentación:** Revisar archivos en `/docs`
- **Issues:** Crear issues en el repositorio
- **Código:** Revisar comentarios en el código fuente

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Estado:** En desarrollo activo  
**✅ Funcionalidad:** Sistema completo operativo