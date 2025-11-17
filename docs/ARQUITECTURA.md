# 🏗️ Arquitectura del Sistema - Hotel Cabañas

## 📋 Visión General

Sistema de gestión hotelera con arquitectura de 3 capas: Frontend (React), Backend (Node.js/Express), y Base de Datos (PostgreSQL).

## 🎯 Arquitectura General

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   React + Vite  │◄──►│ Node.js/Express │◄──►│   PostgreSQL    │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 Frontend Architecture

### **Estructura de Carpetas:**
```
frontend/src/
├── components/
│   ├── layout/           # Header, Footer, Navigation
│   ├── features/         # Cabanas, Hero, Servicios, etc.
│   ├── admin/           # Componentes del panel admin
│   └── ui/              # Componentes reutilizables
├── pages/               # Páginas principales
├── services/            # APIs y servicios
├── hooks/               # Custom hooks
├── styles/              # CSS global y variables
└── utils/               # Utilidades y helpers
```

### **Tecnologías Frontend:**
- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **React Router** - Navegación SPA
- **SweetAlert2** - Modales y alertas
- **Lucide React** - Iconos
- **CSS Modules** - Estilos componetizados

### **Patrones de Diseño:**
- **Component-Based Architecture**
- **Custom Hooks** para lógica reutilizable
- **Lazy Loading** para optimización
- **Responsive Design** mobile-first

## ⚙️ Backend Architecture

### **Estructura de Carpetas:**
```
backend/src/
├── controllers/         # Lógica de controladores
├── services/           # Lógica de negocio
├── models/             # Modelos de Sequelize
├── routes/             # Definición de rutas
├── middlewares/        # Middlewares personalizados
├── config/             # Configuración de BD y app
└── utils/              # Utilidades y helpers
```

### **Tecnologías Backend:**
- **Node.js** - Runtime
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación
- **bcryptjs** - Hash de passwords
- **cors** - Cross-origin requests

### **Patrones de Diseño:**
- **MVC Pattern** (Model-View-Controller)
- **Service Layer** para lógica de negocio
- **Middleware Pattern** para autenticación
- **Repository Pattern** con Sequelize

## 🗄️ Database Architecture

### **Esquema de Base de Datos:**
```sql
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │   cabins    │    │reservations │
│             │    │             │    │             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ name        │    │ user_id (FK)│
│ password    │    │ capacity    │    │ cabin_id(FK)│
│ is_admin    │    │ price       │    │ check_in    │
│ is_guest    │    │ images      │    │ check_out   │
└─────────────┘    │ amenities   │    │ status      │
                   └─────────────┘    └─────────────┘
```

### **Relaciones:**
- **users** 1:N **reservations**
- **cabins** 1:N **reservations**
- **availability** N:1 **cabins**

## 🔐 Sistema de Autenticación

### **Flujo de Autenticación:**
```
1. Usuario → Login → JWT Token
2. Token → LocalStorage → Headers
3. Middleware → Validación → Rutas Protegidas
```

### **Tipos de Usuario:**
- **Invitado** - Sin autenticación
- **Usuario** - JWT requerido
- **Admin** - JWT + rol admin

## 🌐 API Architecture

### **Estructura de Endpoints:**
```
/api
├── /auth              # Autenticación
│   ├── POST /login
│   ├── POST /register
│   └── GET /profile
├── /cabins            # Cabañas
│   ├── GET /
│   ├── GET /:id
│   ├── POST /         # Admin only
│   └── PUT /:id       # Admin only
├── /reservations      # Reservas
│   ├── GET /
│   ├── POST /
│   ├── POST /guest    # Sin auth
│   └── PUT /:id
└── /admin             # Panel admin
    ├── GET /stats
    └── GET /reports
```

### **Códigos de Respuesta:**
- **200** - Éxito
- **201** - Creado
- **400** - Error de validación
- **401** - No autorizado
- **403** - Prohibido
- **404** - No encontrado
- **500** - Error del servidor

## 🔄 Flujo de Datos

### **Reserva de Invitado:**
```
Frontend Form → Validation → API Call → Service → Database → Response → UI Update
```

### **Panel de Admin:**
```
Admin Login → JWT → Protected Routes → API Calls → Real-time Updates
```

## 📱 Responsive Design

### **Breakpoints:**
```css
/* Mobile First */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
```

### **Componentes Adaptativos:**
- **Navigation** - Hamburger en móvil
- **Cards** - Grid responsive
- **Forms** - Stack en móvil
- **Tables** - Scroll horizontal

## 🚀 Performance Optimizations

### **Frontend:**
- **Lazy Loading** de componentes
- **Code Splitting** por rutas
- **Image Optimization** con lazy loading
- **CSS Minification**

### **Backend:**
- **Database Indexing**
- **Query Optimization**
- **Response Compression**
- **Error Handling**

## 🔧 Development Workflow

### **Estructura de Desarrollo:**
```
1. Feature Branch → Development → Testing → Main
2. Local Development → Staging → Production
3. Code Review → Automated Tests → Deployment
```

### **Herramientas de Desarrollo:**
- **Vite** - Hot reload frontend
- **Nodemon** - Auto-restart backend
- **Sequelize CLI** - Migraciones
- **Git** - Control de versiones

## 📊 Monitoring & Logging

### **Logs del Sistema:**
- **Request Logs** - Todas las peticiones
- **Error Logs** - Errores del servidor
- **Database Logs** - Queries y performance
- **User Actions** - Acciones importantes

### **Métricas Importantes:**
- **Response Time** - Tiempo de respuesta
- **Error Rate** - Tasa de errores
- **Database Performance** - Queries lentas
- **User Activity** - Reservas, visitas

## 🔒 Security Measures

### **Seguridad Implementada:**
- **JWT Authentication** - Tokens seguros
- **Password Hashing** - bcrypt
- **Input Validation** - Sanitización
- **CORS Configuration** - Origen controlado
- **SQL Injection Prevention** - Sequelize ORM

### **Mejores Prácticas:**
- **Environment Variables** - Configuración sensible
- **Error Handling** - No exposición de detalles
- **Rate Limiting** - Prevención de ataques
- **HTTPS** - Comunicación encriptada

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Arquitectura estable y funcional