import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const crearCabanaValidators = [
    check('name', 'El nombre de la cabaña es obligatorio').not().isEmpty(),
    check('capacity', 'La capacidad debe ser un número mayor a 0').isInt({ min: 1 }),
    check('price_per_night', 'El precio por noche debe ser un número mayor a 0').isFloat({ min: 0.01 }),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    validarCampos
];

export const actualizarCabanaValidators = [
    check('name', 'El nombre de la cabaña es obligatorio').optional().not().isEmpty(),
    check('capacity', 'La capacidad debe ser un número mayor a 0').optional().isInt({ min: 1 }),
    check('price_per_night', 'El precio por noche debe ser un número mayor a 0').optional().isFloat({ min: 0.01 }),
    validarCampos
];