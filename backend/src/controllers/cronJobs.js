import { actualizarEstadosReservaciones } from '../services/cronJobs.js';

/**
 * Ejecuta manualmente la actualización de estados de reservaciones
 * Solo disponible para administradores
 */
export const ejecutarActualizacionManual = async (req, res) => {
    try {
        const resultado = await actualizarEstadosReservaciones();
        
        if (resultado.success) {
            return res.status(200).json({
                ok: true,
                msg: `Actualización completada. ${resultado.actualizadas} reservaciones actualizadas a 'completed'`,
                actualizadas: resultado.actualizadas
            });
        } else {
            return res.status(500).json({
                ok: false,
                msg: 'Error ejecutando la actualización',
                error: resultado.error
            });
        }
    } catch (error) {
        console.error('Error en ejecutarActualizacionManual:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};