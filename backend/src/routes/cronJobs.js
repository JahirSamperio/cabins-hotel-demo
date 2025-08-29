import { Router } from 'express';
import { ejecutarActualizacionManual } from '../controllers/cronJobs.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = Router();

/**
 * Ruta para ejecutar manualmente la actualización de estados
 * POST /api/cron/actualizar-estados
 * Requiere autenticación de administrador
 */
router.post('/actualizar-estados', validarJWT, validarAdmin, ejecutarActualizacionManual);

export default router;