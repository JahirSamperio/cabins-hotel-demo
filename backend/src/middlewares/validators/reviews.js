import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const crearReviewValidators = [
    check('reservation_id', 'El ID de la reservación es obligatorio').isUUID(),
    check('rating', 'La calificación debe ser entre 1 y 5').isInt({ min: 1, max: 5 }),
    check('content', 'El contenido del review es obligatorio').not().isEmpty(),
    validarCampos
];

export const aprobarReviewValidators = [
    check('status_review', 'El estado debe ser válido').isIn(['approved', 'rejected']),
    check('is_featured', 'El campo destacado debe ser booleano').optional().isBoolean(),
    validarCampos
];

export const crearTestimonioValidators = [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('rating', 'La calificación debe ser entre 1 y 5').isInt({ min: 1, max: 5 }),
    check('content', 'El contenido es obligatorio').not().isEmpty(),
    check('display_order', 'El orden debe ser un número').optional().isInt({ min: 0 }),
    validarCampos
];