import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Reservation from '../models/Reservation.js';
import Cabin from '../models/Cabin.js';
import User from '../models/User.js';

// Exportar reporte financiero
export const exportFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate, filterBy = 'created_at', format = 'json' } = req.query;
        
        const whereClause = { status: { [Op.ne]: 'cancelled' } };
        if (startDate && endDate) {
            whereClause[filterBy] = { [Op.between]: [startDate, endDate] };
        }

        // Obtener datos detallados
        const reservations = await Reservation.findAll({
            attributes: [
                'id', 'guest_name', 'guest_phone', 'total_price', 'amount_paid', 
                'payment_method', 'status', 'created_at', 'check_in', 'check_out',
                'includes_breakfast',
                [sequelize.literal('total_price - amount_paid'), 'pending_amount']
            ],
            include: [
                {
                    model: Cabin,
                    as: 'cabin',
                    attributes: ['name'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email'],
                    required: false
                }
            ],
            where: whereClause,
            order: [['created_at', 'DESC']],
            raw: false
        });

        // Formatear datos para exportación
        const exportData = reservations.map(reservation => ({
            'ID': reservation.id,
            'Huésped': reservation.user?.name || reservation.guest_name,
            'Email/Teléfono': reservation.user?.email || reservation.guest_phone,
            'Cabaña': reservation.cabin?.name || 'N/A',
            'Check-in': reservation.check_in,
            'Check-out': reservation.check_out,
            'Total': parseFloat(reservation.total_price) || 0,
            'Pagado': parseFloat(reservation.amount_paid) || 0,
            'Pendiente': parseFloat(reservation.dataValues.pending_amount) || 0,
            'Método Pago': reservation.payment_method || 'N/A',
            'Desayuno': reservation.includes_breakfast ? 'Sí' : 'No',
            'Estado': reservation.status,
            'Fecha Reserva': reservation.created_at
        }));

        // Calcular resumen
        const summary = {
            'Total Reservas': exportData.length,
            'Ingresos Totales': exportData.reduce((sum, item) => sum + item.Total, 0),
            'Total Pagado': exportData.reduce((sum, item) => sum + item.Pagado, 0),
            'Total Pendiente': exportData.reduce((sum, item) => sum + item.Pendiente, 0),
            'Tasa de Cobro': exportData.length > 0 ? 
                Math.round((exportData.reduce((sum, item) => sum + item.Pagado, 0) / 
                           exportData.reduce((sum, item) => sum + item.Total, 0)) * 100) : 0
        };

        res.json({
            ok: true,
            data: {
                summary,
                reservations: exportData,
                filters: {
                    startDate,
                    endDate,
                    filterBy,
                    generatedAt: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Error exporting financial report:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al exportar reporte financiero'
        });
    }
};

// Exportar agenda de reservaciones
export const exportAgendaReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const whereClause = { status: { [Op.ne]: 'cancelled' } };
        if (startDate && endDate) {
            whereClause[Op.or] = [
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
            ];
        }

        const reservations = await Reservation.findAll({
            attributes: [
                'id', 'guest_name', 'guest_phone', 'total_price', 'amount_paid', 
                'payment_status', 'status', 'check_in', 'check_out', 'guests',
                'includes_breakfast', 'created_at'
            ],
            include: [
                {
                    model: Cabin,
                    as: 'cabin',
                    attributes: ['name'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'phone'],
                    required: false
                }
            ],
            where: whereClause,
            order: [['check_in', 'ASC']],
            limit: 1000
        });

        res.json({
            ok: true,
            data: {
                reservations,
                filters: {
                    startDate,
                    endDate,
                    generatedAt: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Error exporting agenda report:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al exportar agenda'
        });
    }
};