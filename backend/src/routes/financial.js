import { Router } from 'express';
import { 
    getFinancialSummary, 
    getRevenueChart, 
    getPendingPayments, 
    getPaymentMethods,
    getCabinStats
} from '../controllers/financial.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { validarAdmin } from '../middlewares/validar-admin.js';

const router = Router();

// Todas las rutas requieren autenticación y permisos de admin
router.use(validarJWT);
router.use(validarAdmin);

// GET /api/financial/summary - Resumen financiero
router.get('/summary', getFinancialSummary);

// GET /api/financial/revenue-chart - Datos para gráfico de ingresos
router.get('/revenue-chart', getRevenueChart);

// GET /api/financial/pending-payments - Pagos pendientes
router.get('/pending-payments', getPendingPayments);

// GET /api/financial/payment-methods - Estadísticas de métodos de pago
router.get('/payment-methods', getPaymentMethods);

// GET /api/financial/cabin-stats - Estadísticas por cabaña
router.get('/cabin-stats', getCabinStats);

export default router;