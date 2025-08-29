import cron from 'node-cron';
import Reservation from '../models/Reservation.js';
import { Op } from 'sequelize';

/**
 * Actualiza el estado de las reservaciones que han pasado su fecha de checkout
 */
export const actualizarEstadosReservaciones = async () => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
        
        // Buscar reservaciones confirmadas cuya fecha de checkout ya pasó
        const reservacionesVencidas = await Reservation.findAll({
            where: {
                status: 'confirmed',
                check_out: {
                    [Op.lt]: today // check_out menor que la fecha actual
                }
            }
        });

        if (reservacionesVencidas.length > 0) {
            // Actualizar todas las reservaciones vencidas a 'completed'
            const idsActualizados = await Reservation.update(
                { status: 'completed' },
                {
                    where: {
                        status: 'confirmed',
                        check_out: {
                            [Op.lt]: today
                        }
                    }
                }
            );

            console.log(`[CRON] ${idsActualizados[0]} reservaciones actualizadas a 'completed'`);
            
            // Log de las reservaciones actualizadas
            reservacionesVencidas.forEach(reservacion => {
                console.log(`[CRON] Reservación ${reservacion.id} actualizada: checkout ${reservacion.check_out} -> completed`);
            });
        } else {
            console.log('[CRON] No hay reservaciones para actualizar');
        }

        return {
            success: true,
            actualizadas: reservacionesVencidas.length
        };

    } catch (error) {
        console.error('[CRON] Error actualizando estados de reservaciones:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Inicializa todos los cronjobs del sistema
 */
export const inicializarCronJobs = () => {
    // Ejecutar todos los días a las 00:01 (1 minuto después de medianoche)
    cron.schedule('1 0 * * *', async () => {
        console.log('[CRON] Ejecutando actualización de estados de reservaciones...');
        await actualizarEstadosReservaciones();
    }, {
        timezone: "America/Mexico_City" // Ajusta según tu zona horaria
    });

    console.log('[CRON] Cronjobs inicializados correctamente');
};