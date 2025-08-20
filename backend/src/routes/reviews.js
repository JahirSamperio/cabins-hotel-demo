import express from 'express';
import { crearReview, obtenerReviews, aprobarReview, crearTestimonio, obtenerTestimonios } from '../controllers/reviews.js';
import { crearReviewValidators, aprobarReviewValidators, crearTestimonioValidators } from '../middlewares/validators/reviews.js';
import { validarJWT, validarAdmin } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerReviews);
router.get('/testimonials', obtenerTestimonios);

// Rutas de usuario autenticado
router.post('/', [validarJWT, ...crearReviewValidators], crearReview);

// Rutas de administrador
router.put('/:id/approve', [validarJWT, validarAdmin, ...aprobarReviewValidators], aprobarReview);
router.post('/testimonials', [validarJWT, validarAdmin, ...crearTestimonioValidators], crearTestimonio);

export default router;