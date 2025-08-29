import { Router } from 'express';
import { exportFinancialReport, exportAgendaReport } from '../controllers/export.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

const router = Router();

// Todas las rutas requieren autenticación y permisos de admin
router.use(validarJWT);
router.use(validarAdmin);

// GET /api/export/financial - Exportar reporte financiero
router.get('/financial', exportFinancialReport);

// GET /api/export/agenda - Exportar agenda de reservaciones
router.get('/agenda', exportAgendaReport);

// GET /api/export/agenda - Exportar agenda de reservaciones
router.get('/agenda', exportAgendaReport);

export default router;