import express from 'express';
import { consultarDisponibilidad } from '../controllers/availability.js';

const router = express.Router();

// Ruta pública para consultar disponibilidad
router.get('/check', consultarDisponibilidad);

export default router;