import { Router } from 'express';
import { getStats, getRecentBookings } from '../controllers/admin.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

const router = Router();

// Todas las rutas requieren autenticación y permisos de admin
router.use(validarJWT);
router.use(validarAdmin);

// GET /api/admin/stats - Obtener estadísticas del dashboard
router.get('/stats', getStats);

// GET /api/admin/recent-bookings - Obtener reservaciones recientes
router.get('/recent-bookings', getRecentBookings);

export default router;