import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const actualizarDisponibilidadValidators = [
    check('cabin_id', 'El ID de la cabaña es obligatorio').isUUID(),
    check('date', 'La fecha es obligatoria').isDate(),
    check('is_available', 'La disponibilidad debe ser booleana').isBoolean(),
    check('price_override', 'El precio debe ser un número mayor a 0').optional().isFloat({ min: 0.01 }),
    validarCampos
];

export const bloquearFechasValidators = [
    check('cabin_id', 'El ID de la cabaña es obligatorio').isUUID(),
    check('start_date', 'La fecha de inicio es obligatoria').isDate(),
    check('end_date', 'La fecha de fin es obligatoria').isDate(),
    validarCampos
];