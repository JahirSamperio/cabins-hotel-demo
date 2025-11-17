# 🎨 Frontend Documentation - Hotel Cabañas

## 📋 Tecnologías Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **React Router** - Navegación SPA
- **SweetAlert2** - Modales y alertas elegantes
- **Lucide React** - Iconos modernos
- **CSS Modules** - Estilos componetizados

## 🏗️ Estructura del Proyecto

```
frontend/src/
├── components/
│   ├── layout/           # Componentes de layout
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Navigation.jsx
│   ├── features/         # Componentes de funcionalidades
│   │   ├── Hero.jsx
│   │   ├── Cabanas.jsx
│   │   ├── Servicios.jsx
│   │   ├── Galeria.jsx
│   │   └── Contacto.jsx
│   ├── admin/           # Panel de administración
│   │   ├── Dashboard.jsx
│   │   ├── Agenda.jsx
│   │   └── CabinManager.jsx
│   └── ui/              # Componentes UI reutilizables
│       ├── LazyImage.jsx
│       ├── SEOHead.jsx
│       └── WhatsAppButton.jsx
├── pages/               # Páginas principales
│   ├── HomePage.jsx
│   ├── CabanasPage.jsx
│   ├── CabanaDetailPage.jsx
│   ├── ReservarPage.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── Admin.jsx
├── services/            # APIs y servicios
│   ├── api.js
│   ├── adminService.js
│   └── availabilityService.js
├── hooks/               # Custom hooks
│   └── useLazyLoad.js
├── styles/              # Estilos globales
│   ├── index.css
│   └── App.css
└── utils/               # Utilidades
    └── apiInterceptor.js
```

---

## 🎯 Páginas Principales

### **HomePage.jsx**
Página principal con todas las secciones del sitio.

**Componentes incluidos:**
- Hero - Banner principal
- Galeria - Galería de imágenes
- Cabanas - Cabañas destacadas (3)
- Servicios - Servicios ofrecidos
- Beneficios - Beneficios del lugar
- Availability - Disponibilidad
- Mapa - Ubicación
- VirtualTour - Tour virtual
- Contacto - Información de contacto
- Testimonios - Testimonios de clientes
- Reviews - Reseñas

**Características:**
- ✅ Lazy loading de componentes
- ✅ SEO optimizado
- ✅ Scroll suave entre secciones
- ✅ Responsive design

### **CabanasPage.jsx**
Lista completa de cabañas con filtros.

**Funcionalidades:**
- ✅ Filtros por capacidad y precio
- ✅ Ordenamiento múltiple
- ✅ Búsqueda por nombre
- ✅ Paginación
- ✅ Vista de grid responsive

### **CabanaDetailPage.jsx**
Detalles individuales de cada cabaña.

**Características:**
- ✅ Galería de imágenes con navegación
- ✅ Información completa
- ✅ Amenidades listadas
- ✅ Botón de reserva directo
- ✅ Breadcrumbs de navegación

### **ReservarPage.jsx**
Formulario completo de reservas para invitados.

**Funcionalidades:**
- ✅ Validaciones robustas
- ✅ Cálculo automático de precios
- ✅ Campo de desayunador
- ✅ SweetAlert2 para confirmaciones
- ✅ Estados de carga profesionales

---

## 🧩 Componentes de Layout

### **Header.jsx**
Navegación principal del sitio.

**Características:**
- ✅ Logo y navegación
- ✅ Menú hamburguesa en móvil
- ✅ Botones de login/registro
- ✅ Indicador de usuario logueado

### **Footer.jsx**
Pie de página con información de contacto.

**Incluye:**
- ✅ Información de contacto
- ✅ Enlaces rápidos
- ✅ Redes sociales
- ✅ Copyright

---

## 🎨 Componentes de Features

### **Hero.jsx**
Banner principal con call-to-action.

```jsx
// Características principales
- Video/imagen de fondo
- Texto principal atractivo
- Botones de acción
- Overlay con gradiente
```

### **Cabanas.jsx**
Componente reutilizable para mostrar cabañas.

**Props:**
```jsx
{
  showAll: boolean,        // Mostrar todas o limitadas
  limit: number,           // Límite de cabañas
  cabanas: array          // Cabañas pre-cargadas (opcional)
}
```

**Funcionalidades:**
- ✅ Carga desde API
- ✅ Estados de loading/error
- ✅ Navegación a detalles
- ✅ Botones de reserva

### **Galeria.jsx**
Galería de imágenes del hotel.

**Características:**
- ✅ Grid responsive
- ✅ Lazy loading de imágenes
- ✅ Modal de vista ampliada
- ✅ Navegación con teclado

---

## 👑 Componentes de Admin

### **Dashboard.jsx**
Panel principal de administración.

**Métricas mostradas:**
- Total de reservaciones
- Ingresos del mes
- Tasa de ocupación
- Reservas pendientes
- Gráficos de tendencias

### **Agenda.jsx**
Calendario de ocupación y gestión.

**Funcionalidades:**
- ✅ Vista de calendario mensual
- ✅ Filtros por cabaña
- ✅ Creación de reservas
- ✅ Gestión de disponibilidad
- ✅ Exportación a CSV

### **CabinManager.jsx**
Gestión completa de cabañas.

**Operaciones:**
- ✅ CRUD completo
- ✅ Subida de imágenes
- ✅ Gestión de amenidades
- ✅ Estados activo/inactivo

---

## 🔧 Componentes UI

### **LazyImage.jsx**
Componente para carga lazy de imágenes.

```jsx
<LazyImage
  src="image-url"
  alt="descripción"
  width={400}
  height={300}
  className="custom-class"
/>
```

**Características:**
- ✅ Intersection Observer
- ✅ Placeholder mientras carga
- ✅ Fallback para errores
- ✅ Optimización de performance

### **SEOHead.jsx**
Componente para metadatos SEO.

```jsx
<SEOHead 
  title="Título de la página"
  description="Descripción meta"
  canonical="https://example.com/page"
  ogImage="https://example.com/image.jpg"
/>
```

### **WhatsAppButton.jsx**
Botón flotante de WhatsApp.

**Características:**
- ✅ Posición fija
- ✅ Animación de entrada
- ✅ Mensaje predefinido
- ✅ Responsive

---

## 🎣 Custom Hooks

### **useLazyLoad.js**
Hook para lazy loading con Intersection Observer.

```jsx
const { ref, inView } = useLazyLoad({
  threshold: 0.1,
  rootMargin: '50px'
})

// Uso en componente
<div ref={ref}>
  {inView && <ComponentePesado />}
</div>
```

---

## 🌐 Servicios

### **api.js**
Servicio principal para comunicación con backend.

**APIs disponibles:**
```javascript
// Cabañas
cabinsAPI.getAll()
cabinsAPI.getById(id)

// Reservaciones
reservationsAPI.create(data, token)
reservationsAPI.createGuest(data)
reservationsAPI.getAll(token)
reservationsAPI.update(id, data, token)

// Autenticación
authAPI.login(credentials)
authAPI.register(userData)
authAPI.getProfile(token)
```

### **adminService.js**
Servicios específicos para administración.

```javascript
// Estadísticas
adminService.getStats(token)
adminService.getReservationsByDateRange(token, start, end)

// Reportes
adminService.exportReservations(token, filters)
```

---

## 🎨 Sistema de Estilos

### **Variables CSS:**
```css
:root {
  --primary-color: #2c5530;
  --secondary-color: #8b4513;
  --accent-color: #d4af37;
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;
  --bg-light: #f8f9fa;
  --white: #ffffff;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}
```

### **Breakpoints:**
```css
/* Mobile First */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
```

### **Clases Utilitarias:**
```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.section { padding: 4rem 0; }
.text-center { text-align: center; }
.btn { /* Estilos base de botones */ }
.btn-primary { /* Botón primario */ }
.btn-secondary { /* Botón secundario */ }
```

---

## 🚀 Optimizaciones de Performance

### **Lazy Loading:**
```jsx
// Componentes
const ComponentePesado = lazy(() => import('./ComponentePesado'))

// Imágenes
<LazyImage src="imagen.jpg" alt="descripción" />

// Secciones
const { ref, inView } = useLazyLoad()
<div ref={ref}>
  {inView && <SeccionPesada />}
</div>
```

### **Code Splitting:**
```jsx
// Por rutas
const HomePage = lazy(() => import('./pages/HomePage'))
const AdminPage = lazy(() => import('./pages/Admin'))

// Por funcionalidad
const AdminComponents = lazy(() => import('./components/admin'))
```

### **Memoización:**
```jsx
// Componentes
const ComponenteOptimizado = memo(({ data }) => {
  return <div>{data.name}</div>
})

// Valores calculados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// Callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

---

## 📱 Responsive Design

### **Estrategia Mobile-First:**
```css
/* Base: Mobile */
.component {
  display: block;
  width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    display: flex;
    width: 50%;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    width: 33.333%;
  }
}
```

### **Componentes Adaptativos:**
- **Navigation:** Hamburger → Full menu
- **Cards:** Stack → Grid
- **Forms:** Single column → Multi-column
- **Tables:** Scroll → Full width

---

## 🔧 Configuración de Desarrollo

### **Vite Config:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### **Variables de Entorno:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Cabañas Huasca
VITE_WHATSAPP_NUMBER=5215512345678
```

---

## 🧪 Testing (Sugerido)

### **Estructura de Tests:**
```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── services/
├── setupTests.js
└── testUtils.js
```

### **Herramientas Recomendadas:**
- **Vitest** - Test runner
- **React Testing Library** - Testing utilities
- **MSW** - API mocking
- **Cypress** - E2E testing

---

**📅 Última actualización:** Septiembre 2024  
**🔄 Versión:** 1.0  
**✅ Estado:** Frontend completo y funcional