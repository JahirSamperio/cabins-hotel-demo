import Cabin from '../models/Cabin.js';
import Reservation from '../models/Reservation.js';
import { Op } from 'sequelize';

export const consultarDisponibilidad = async (req, res) => {
    try {
        const { check_in, check_out, guests } = req.query;

        if (!check_in || !check_out || !guests) {
            return res.status(400).json({
                ok: false,
                msg: 'Faltan parámetros requeridos: check_in, check_out, guests'
            });
        }

        const cabins = await Cabin.findAll({
            where: {
                capacity: { [Op.gte]: parseInt(guests) },
                is_active: true
            }
        });

        const availableCabins = [];
        
        for (const cabin of cabins) {
            const conflictingReservations = await Reservation.count({
                where: {
                    cabin_id: cabin.id,
                    [Op.and]: [
                        { check_in: { [Op.lt]: check_out } },
                        { check_out: { [Op.gt]: check_in } }
                    ],
                    status: { [Op.in]: ['confirmed', 'checked_in'] }
                }
            });

            if (conflictingReservations === 0) {
                availableCabins.push({
                    id: cabin.id,
                    name: cabin.name,
                    capacity: cabin.capacity,
                    price_per_night: cabin.price_per_night,
                    description: cabin.description,
                    amenities: cabin.amenities,
                    images: cabin.images
                });
            }
        }

        res.status(200).json({
            ok: true,
            msg: `${availableCabins.length} cabañas disponibles`,
            cabins: availableCabins
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};