import Cabin from '../models/Cabin.js';
import Availability from '../models/Availability.js';
import Reservation from '../models/Reservation.js';
import { Op } from 'sequelize';

export const consultarDisponibilidadService = async (check_in, check_out, guests) => {
    try {
        // Buscar cabañas que tengan capacidad suficiente
        const cabins = await Cabin.findAll({
            where: {
                capacity: { [Op.gte]: guests },
                is_active: true
            },
            include: [
                {
                    model: Availability,
                    where: {
                        date: {
                            [Op.between]: [check_in, check_out]
                        },
                        is_available: true
                    },
                    required: false
                },
                {
                    model: Reservation,
                    where: {
                        [Op.or]: [
                            {
                                check_in: { [Op.between]: [check_in, check_out] }
                            },
                            {
                                check_out: { [Op.between]: [check_in, check_out] }
                            },
                            {
                                [Op.and]: [
                                    { check_in: { [Op.lte]: check_in } },
                                    { check_out: { [Op.gte]: check_out } }
                                ]
                            }
                        ],
                        status: { [Op.in]: ['confirmed', 'checked_in'] }
                    },
                    required: false
                }
            ]
        });

        // Filtrar cabañas disponibles
        const availableCabins = cabins.filter(cabin => {
            return cabin.Reservations.length === 0;
        }).map(cabin => ({
            id: cabin.id,
            name: cabin.name,
            capacity: cabin.capacity,
            price_per_night: cabin.price_per_night,
            description: cabin.description,
            amenities: cabin.amenities,
            images: cabin.images
        }));

        return {
            status: 200,
            ok: true,
            msg: `${availableCabins.length} cabañas disponibles`,
            cabins: availableCabins
        };

    } catch (error) {
        return {
            status: 500,
            ok: false,
            msg: 'Error al consultar disponibilidad'
        };
    }
};