import Availability from "../models/Availability.js";
import Reservation from "../models/Reservation.js";
import Cabin from "../models/Cabin.js";
import { Op } from 'sequelize';

export const obtenerDisponibilidadService = async (cabin_id, start_date, end_date) => {
    try {
        // Verificar que la cabaña existe
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        // Obtener disponibilidad personalizada
        const customAvailability = await Availability.findAll({
            where: {
                cabin_id,
                date: {
                    [Op.between]: [start_date, end_date]
                }
            }
        });

        // Obtener reservaciones en el rango
        const reservations = await Reservation.findAll({
            where: {
                cabin_id,
                status: ['confirmed', 'pending'],
                [Op.or]: [
                    {
                        check_in: {
                            [Op.between]: [start_date, end_date]
                        }
                    },
                    {
                        check_out: {
                            [Op.between]: [start_date, end_date]
                        }
                    }
                ]
            }
        });

        return {
            ok: true,
            status: 200,
            msg: "Disponibilidad obtenida exitosamente",
            availability: {
                custom_availability: customAvailability,
                reservations,
                base_price: cabin.price_per_night
            }
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const actualizarDisponibilidadService = async (cabin_id, date, is_available, price_override) => {
    try {
        const [availability, created] = await Availability.findOrCreate({
            where: { cabin_id, date },
            defaults: { cabin_id, date, is_available, price_override }
        });

        if (!created) {
            await availability.update({ is_available, price_override });
        }

        return {
            ok: true,
            status: created ? 201 : 200,
            msg: created ? "Disponibilidad creada exitosamente" : "Disponibilidad actualizada exitosamente",
            availability
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};

export const bloquearFechasService = async (cabin_id, start_date, end_date, reason) => {
    try {
        const dates_to_block = [];
        const currentDate = new Date(start_date);
        const endDate = new Date(end_date);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dates_to_block.push({
                cabin_id,
                date: dateStr,
                is_available: false
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const blocked_dates = await Availability.bulkCreate(dates_to_block, {
            ignoreDuplicates: true
        });

        return {
            ok: true,
            status: 201,
            msg: "Fechas bloqueadas exitosamente",
            blocked_dates
        };

    } catch (error) {
        console.log(error);
        return {
            ok: false,
            status: 500,
            msg: 'Error en el servidor'
        };
    }
};