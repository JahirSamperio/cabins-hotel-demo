# 🔌 API Documentation - Hotel Cabañas

## 📋 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 Autenticación

### **JWT Token**
```javascript
Headers: {
  'x-token': 'your-jwt-token-here'
}
```

### **Tipos de Acceso:**
- 🌐 **Público** - Sin autenticación
- 🔒 **Usuario** - JWT requerido
- 👑 **Admin** - JWT + rol admin

---

## 🏠 Endpoints de Cabañas

### **GET /cabins**
Obtener todas las cabañas activas

**Acceso:** 🌐 Público

**Response:**
```json
{
  "ok": true,
  "cabins": [
    {
      "id": "uuid",
      "name": "Cabaña Rústica",
      "capacity": 4,
      "price_per_night": 1200,
      "description": "Cabaña acogedora...",
      "images": ["url1", "url2"],
      "amenities": ["WiFi", "Cocina"],
      "is_active": true
    }
  ]
}
```

### **GET /cabins/:id**
Obtener cabaña por ID

**Acceso:** 🌐 Público

**Response:**
```json
{
  "ok": true,
  "cabin": {
    "id": "uuid",
    "name": "Cabaña Rústica",
    "capacity": 4,
    "price_per_night": 1200,
    "description": "Descripción completa...",
    "images": ["url1", "url2"],
    "amenities": ["WiFi", "Cocina", "Estacionamiento"]
  }
}
```

### **POST /cabins**
Crear nueva cabaña

**Acceso:** 👑 Admin

**Body:**
```json
{
  "name": "Nueva Cabaña",
  "capacity": 6,
  "price_per_night": 1500,
  "description": "Descripción...",
  "images": ["url1", "url2"],
  "amenities": ["WiFi", "Cocina"]
}
```

### **PUT /cabins/:id**
Actualizar cabaña

**Acceso:** 👑 Admin

**Body:** Campos a actualizar

---

## 🎫 Endpoints de Reservaciones

### **GET /reservations**
Obtener reservaciones del usuario

**Acceso:** 🔒 Usuario

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 10)
- `status` - Filtrar por estado
- `search` - Buscar por nombre

**Response:**
```json
{
  "ok": true,
  "reservations": [
    {
      "id": "uuid",
      "cabin": {
        "name": "Cabaña Rústica",
        "capacity": 4
      },
      "check_in": "2024-12-15",
      "check_out": "2024-12-17",
      "guests": 4,
      "total_price": 3600,
      "status": "confirmed",
      "payment_status": "pending"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

### **POST /reservations**
Crear reservación (usuario registrado)

**Acceso:** 🔒 Usuario

**Body:**
```json
{
  "cabin_id": "uuid",
  "check_in": "2024-12-15",
  "check_out": "2024-12-17",
  "guests": 4,
  "special_requests": "Vista al lago",
  "includes_breakfast": true
}
```

### **POST /reservations/guest**
Crear reservación como invitado

**Acceso:** 🌐 Público

**Body:**
```json
{
  "cabin_id": "uuid",
  "check_in": "2024-12-15",
  "check_out": "2024-12-17",
  "guests": 4,
  "guest_name": "Juan Pérez",
  "guest_email": "juan@email.com",
  "guest_phone": "55 1234 5678",
  "special_requests": "Llegada tarde",
  "includes_breakfast": false
}
```

### **POST /reservations/walk-in**
Crear reservación walk-in (admin)

**Acceso:** 👑 Admin

**Body:**
```json
{
  "cabin_id": "uuid",
  "check_in": "2024-12-15",
  "check_out": "2024-12-17",
  "guests": 4,
  "guest_name": "María García",
  "guest_phone": "55 9876 5432",
  "payment_method": "cash",
  "payment_status": "paid",
  "includes_breakfast": true
}
```

### **PUT /reservations/:id**
Actualizar reservación

**Acceso:** 🔒 Usuario / 👑 Admin

**Body:**
```json
{
  "status": "cancelled",
  "payment_status": "paid",
  "amount_paid": 1800
}
```

### **GET /reservations/range**
Obtener reservaciones por rango de fechas

**Acceso:** 🔒 Usuario / 👑 Admin

**Query Parameters:**
- `start_date` - Fecha inicio (YYYY-MM-DD)
- `end_date` - Fecha fin (YYYY-MM-DD)

---

## 👤 Endpoints de Autenticación

### **POST /auth/login**
Iniciar sesión

**Acceso:** 🌐 Público

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "is_admin": false
  }
}
```

### **POST /auth/register**
Registrar nuevo usuario

**Acceso:** 🌐 Público

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "55 1234 5678"
}
```

### **GET /auth/profile**
Obtener perfil del usuario

**Acceso:** 🔒 Usuario

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "55 1234 5678",
    "is_admin": false
  }
}
```

---

## 📊 Endpoints de Administración

### **GET /admin/stats**
Obtener estadísticas del dashboard

**Acceso:** 👑 Admin

**Response:**
```json
{
  "ok": true,
  "stats": {
    "totalReservations": 150,
    "totalRevenue": 180000,
    "occupancyRate": 75,
    "pendingReservations": 12,
    "monthlyGrowth": 15.5
  }
}
```

### **GET /admin/reservations**
Obtener todas las reservaciones (admin)

**Acceso:** 👑 Admin

**Query Parameters:**
- `page`, `limit`, `status`, `search` (igual que usuario)
- `booking_type` - Filtrar por tipo de reserva
- `payment_status` - Filtrar por estado de pago
- `date_range` - Filtrar por rango de fechas

---

## 🗓️ Endpoints de Disponibilidad

### **GET /availability**
Obtener disponibilidad por rango

**Acceso:** 👑 Admin

**Query Parameters:**
- `start_date` - Fecha inicio
- `end_date` - Fecha fin
- `cabin_id` - ID de cabaña específica

### **POST /availability**
Crear/actualizar disponibilidad

**Acceso:** 👑 Admin

**Body:**
```json
{
  "cabin_id": "uuid",
  "start_date": "2024-12-15",
  "end_date": "2024-12-20",
  "is_available": false,
  "price_override": 1800
}
```

---

## ❌ Códigos de Error

### **Códigos HTTP:**
- `200` - ✅ Éxito
- `201` - ✅ Creado
- `400` - ❌ Error de validación
- `401` - ❌ No autorizado
- `403` - ❌ Prohibido
- `404` - ❌ No encontrado
- `409` - ❌ Conflicto (fechas ocupadas)
- `500` - ❌ Error del servidor

### **Formato de Error:**
```json
{
  "ok": false,
  "msg": "Descripción del error",
  "errors": ["Error específico 1", "Error específico 2"]
}
```

### **Errores Comunes:**

#### **400 - Validación:**
```json
{
  "ok": false,
  "msg": "Errores de validación",
  "errors": [
    "El email es requerido",
    "La fecha de check-in no puede ser pasada"
  ]
}
```

#### **401 - No autorizado:**
```json
{
  "ok": false,
  "msg": "Token no válido"
}
```

#### **409 - Conflicto:**
```json
{
  "ok": false,
  "msg": "La cabaña no está disponible en las fechas seleccionadas"
}
```

---

## 🔧 Validaciones

### **Reservaciones:**
- Fechas válidas (check-out > check-in)
- Capacidad no excedida
- Disponibilidad de cabaña
- Datos de contacto válidos

### **Cabañas:**
- Nombre único
- Capacidad > 0
- Precio > 0
- Imágenes válidas (URLs)

### **Usuarios:**
- Email único y válido
- Password mínimo 6 caracteres
- Teléfono válido (10+ dígitos)

---

## 📝 Ejemplos de Uso

### **Crear Reserva de Invitado:**
```javascript
const response = await fetch('/api/reservations/guest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cabin_id: 'abc-123',
    check_in: '2024-12-15',
    check_out: '2024-12-17',
    guests: 4,
    guest_name: 'Juan Pérez',
    guest_email: 'juan@email.com',
    guest_phone: '55 1234 5678',
    includes_breakfast: true
  })
})

const data = await response.json()
```

### **Obtener Cabañas:**
```javascript
const response = await fetch('/api/cabins')
const { cabins } = await response.json()
```

### **Login de Usuario:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})

const { token, user } = await response.json()
localStorage.setItem('token', token)
```

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión API:** v1  
**✅ Estado:** Documentación completa y actualizada