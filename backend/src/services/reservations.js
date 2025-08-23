import Reservation from "../models/Reservation.js";
import Cabin from "../models/Cabin.js";
import User from "../models/User.js";
import { Op } from "sequelize";

export const crearReservacionService = async (user_id, cabin_id, check_in, check_out, guests, special_requests, includes_breakfast = false) => {
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

        // Verificar disponibilidad de fechas
        const conflictingReservation = await Reservation.findOne({
            where: {
                cabin_id,
                status: ['pending', 'confirmed'],
                [Op.or]: [
                    {
                        check_in: {
                            [Op.between]: [check_in, check_out]
                        }
                    },
                    {
                        check_out: {
                            [Op.between]: [check_in, check_out]
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                check_in: {
                                    [Op.lte]: check_in
                                }
                            },
                            {
                                check_out: {
                                    [Op.gte]: check_out
                                }
                            }
                        ]
                    }
                ]
            }
        });

        if (conflictingReservation) {
            return {
                ok: false,
                status: 400,
                msg: "La cabaña no está disponible en las fechas seleccionadas"
            };
        }

        // Calcular precio total
        const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
        const basePrice = nights * cabin.price_per_night;
        const breakfastPrice = includes_breakfast ? (guests * nights * 150) : 0;
        const total_price = basePrice + breakfastPrice;

        const reservation = await Reservation.create({
            user_id,
            cabin_id,
            check_in,
            check_out,
            guests,
            total_price,
            special_requests,
            includes_breakfast,
            status: 'pending',
            booking_type: 'online',
            payment_method: 'online',
            payment_status: 'pending'
        });

        return {
            ok: true,
            status: 201,
            msg: "Reservación creada exitosamente",
            reservation
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

export const crearReservacionWalkInService = async (cabin_id, check_in, check_out, guests, guest_name, guest_phone, payment_method, payment_status, created_by_admin, includes_breakfast = false) => {
    try {
        const cabin = await Cabin.findByPk(cabin_id);
        if (!cabin) {
            return {
                ok: false,
                status: 404,
                msg: "Cabaña no encontrada"
            };
        }

        // Verificar disponibilidad de fechas
        console.log('Walk-in validation - Cabin:', cabin_id, 'Dates:', check_in, 'to', check_out);
        
        // Buscar todas las reservaciones activas para debug
        const allActiveReservations = await Reservation.findAll({
            where: {
                cabin_id,
                status: ['pending', 'confirmed']
            }
        });
        console.log('Active reservations for this cabin:', allActiveReservations.map(r => ({
            id: r.id,
            dates: `${r.check_in} to ${r.check_out}`,
            status: r.status
        })));
        const conflictingReservation = await Reservation.findOne({
            where: {
                cabin_id,
                status: ['pending', 'confirmed'],
                [Op.or]: [
                    {
                        check_in: {
                            [Op.between]: [check_in, check_out]
                        }
                    },
                    {
                        check_out: {
                            [Op.between]: [check_in, check_out]
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                check_in: {
                                    [Op.lte]: check_in
                                }
                            },
                            {
                                check_out: {
                                    [Op.gte]: check_out
                                }
                            }
                        ]
                    }
                ]
            }
        });

        if (conflictingReservation) {
            return {
                ok: false,
                status: 400,
                msg: "La cabaña no está disponible en las fechas seleccionadas"
            };
        }

        const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
        const basePrice = nights * cabin.price_per_night;
        const breakfastPrice = includes_breakfast ? (guests * nights * 150) : 0;
        const total_price = basePrice + breakfastPrice;

        const reservation = await Reservation.create({
            user_id: '00000000-0000-0000-0000-000000000001', // Usuario invitado
            cabin_id,
            check_in,
            check_out,
            guests,
            total_price,
            status: 'confirmed',
            booking_type: 'walk_in',
            created_by_admin,
            guest_name,
            guest_phone,
            payment_method,
            payment_status,
            includes_breakfast
        });

        return {
            ok: true,
            status: 201,
            msg: "Reservación walk-in creada exitosamente",
            reservation
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

export const obtenerReservacionesPorRangoService = async (user_id, is_admin, startDate, endDate) => {
    try {
        let whereClause = {
            [Op.or]: [
                {
                    check_in: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                {
                    check_out: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                {
                    [Op.and]: [
                        {
                            check_in: {
                                [Op.lte]: startDate
                            }
                        },
                        {
                            check_out: {
                                [Op.gte]: endDate
                            }
                        }
                    ]
                }
            ]
        };
        
        if (!is_admin) {
            whereClause.user_id = user_id;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Cabin,
                    attributes: ['name', 'capacity']
                },
                {
                    model: User,
                    attributes: ['name', 'phone'],
                    required: false
                }
            ],
            order: [['check_in', 'ASC']]
        });

        return {
            ok: true,
            status: 200,
            msg: "Reservaciones obtenidas exitosamente",
            reservations
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

export const obtenerReservacionesService = async (user_id, is_admin, page = 1, limit = 10, filters = {}) => {
    try {
        let whereClause = {};
        let includeClause = [
            {
                model: Cabin,
                attributes: ['name', 'capacity']
            },
            {
                model: User,
                attributes: ['name', 'phone'],
                required: false
            }
        ];
        
        if (!is_admin) {
            whereClause.user_id = user_id;
        }

        // Aplicar filtros
        if (filters.status) {
            whereClause.status = filters.status;
        }
        
        if (filters.payment_status) {
            whereClause.payment_status = filters.payment_status;
        }
        
        if (filters.booking_type) {
            whereClause.booking_type = filters.booking_type;
        }
        
        if (filters.date) {
            console.log('Filtering by date:', filters.date);
            whereClause[Op.or] = [
                {
                    check_in: filters.date
                },
                {
                    check_out: filters.date
                },
                {
                    [Op.and]: [
                        {
                            check_in: {
                                [Op.lt]: filters.date
                            }
                        },
                        {
                            check_out: {
                                [Op.gt]: filters.date
                            }
                        }
                    ]
                }
            ];
        }
        
        if (filters.date_range === 'week') {
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            whereClause.check_in = {
                [Op.between]: [today.toISOString().split('T')[0], weekFromNow.toISOString().split('T')[0]]
            };
        }
        
        if (filters.date_range === 'month') {
            const today = new Date();
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            whereClause.check_in = {
                [Op.between]: [today.toISOString().split('T')[0], monthFromNow.toISOString().split('T')[0]]
            };
        }
        
        // Búsqueda por nombre de cliente
        if (filters.search) {
            whereClause[Op.or] = [
                {
                    guest_name: {
                        [Op.iLike]: `%${filters.search}%`
                    }
                },
                {
                    '$user.name$': {
                        [Op.iLike]: `%${filters.search}%`
                    }
                }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: reservations } = await Reservation.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        return {
            ok: true,
            status: 200,
            msg: "Reservaciones obtenidas exitosamente",
            reservations,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
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

export const obtenerReservacionService = async (id, user_id, is_admin) => {
    try {
        let whereClause = { id };
        
        if (!is_admin) {
            whereClause.user_id = user_id;
        }

        const reservation = await Reservation.findOne({
            where: whereClause,
            include: [
                {
                    model: Cabin,
                    attributes: ['name', 'capacity', 'description']
                }
            ]
        });

        if (!reservation) {
            return {
                ok: false,
                status: 404,
                msg: "Reservación no encontrada"
            };
        }

        return {
            ok: true,
            status: 200,
            msg: "Reservación obtenida exitosamente",
            reservation
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

export const actualizarReservacionService = async (id, updateData, user_id, is_admin) => {
    try {
        let whereClause = { id };
        
        if (!is_admin) {
            whereClause.user_id = user_id;
            // Los usuarios solo pueden cancelar
            updateData = { status: 'cancelled' };
        }

        const reservation = await Reservation.findOne({ where: whereClause });

        if (!reservation) {
            return {
                ok: false,
                status: 404,
                msg: "Reservación no encontrada"
            };
        }

        // Lógica especial para total personalizado
        if (updateData.total_price !== undefined) {
            const newTotal = parseFloat(updateData.total_price)
            if (newTotal < 0) {
                return {
                    ok: false,
                    status: 400,
                    msg: "El total no puede ser negativo"
                }
            }
        }
        
        // Lógica especial para pagos
        if (updateData.amount_paid !== undefined) {
            const amountPaid = parseFloat(updateData.amount_paid);
            const totalPrice = parseFloat(updateData.total_price || reservation.total_price);
            
            console.log('Payment logic - Amount:', amountPaid, 'Total:', totalPrice);
            
            // Validar monto
            if (amountPaid < 0) {
                return {
                    ok: false,
                    status: 400,
                    msg: "El monto pagado no puede ser negativo"
                };
            }
            
            if (amountPaid > totalPrice) {
                return {
                    ok: false,
                    status: 400,
                    msg: "El monto pagado no puede ser mayor al total"
                };
            }
            
            // Auto-actualizar payment_status basado en amount_paid
            if (amountPaid === 0) {
                updateData.payment_status = 'pending';
            } else if (amountPaid >= totalPrice) {
                updateData.payment_status = 'paid';
            } else {
                updateData.payment_status = 'partial';
            }
            
            console.log('New payment status:', updateData.payment_status);
        }

        // Si se están actualizando fechas, verificar disponibilidad
        if (updateData.check_in || updateData.check_out) {
            const newCheckIn = updateData.check_in || reservation.check_in;
            const newCheckOut = updateData.check_out || reservation.check_out;
            
            const conflictingReservation = await Reservation.findOne({
                where: {
                    id: { [Op.ne]: id }, // Excluir la reservación actual
                    cabin_id: reservation.cabin_id,
                    status: ['pending', 'confirmed'],
                    [Op.or]: [
                        {
                            check_in: {
                                [Op.between]: [newCheckIn, newCheckOut]
                            }
                        },
                        {
                            check_out: {
                                [Op.between]: [newCheckIn, newCheckOut]
                            }
                        },
                        {
                            [Op.and]: [
                                {
                                    check_in: {
                                        [Op.lte]: newCheckIn
                                    }
                                },
                                {
                                    check_out: {
                                        [Op.gte]: newCheckOut
                                    }
                                }
                            ]
                        }
                    ]
                }
            });

            if (conflictingReservation) {
                return {
                    ok: false,
                    status: 400,
                    msg: "La cabaña no está disponible en las fechas seleccionadas"
                };
            }
        }

        await reservation.update(updateData);
        
        // Recargar la reservación actualizada para devolver los datos más recientes
        const updatedReservation = await Reservation.findByPk(id, {
            include: [
                {
                    model: Cabin,
                    attributes: ['name', 'capacity']
                },
                {
                    model: User,
                    attributes: ['name', 'phone'],
                    required: false
                }
            ]
        });

        return {
            ok: true,
            status: 200,
            msg: "Reservación actualizada exitosamente",
            reservation: updatedReservation
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