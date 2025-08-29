import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import Cabin from '../models/Cabin.js';

// Obtener resumen financiero por rango de fechas
export const getFinancialSummary = async (req, res) => {
    try {
        const { startDate, endDate, filterBy = 'created_at' } = req.query;
        
        // Construir whereClause optimizado
        const whereClause = { status: { [Op.ne]: 'cancelled' } };
        if (startDate && endDate) {
            whereClause[filterBy] = { [Op.between]: [startDate, endDate] };
        }

        // Consulta única optimizada
        const [summary] = await Reservation.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_reservations'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue'],
                [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_paid'],
                [sequelize.fn('SUM', sequelize.literal('total_price - amount_paid')), 'total_pending'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN amount_paid = 0 THEN 1 END")), 'unpaid_count'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN amount_paid > 0 AND amount_paid < total_price THEN 1 END")), 'partial_count'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN amount_paid >= total_price THEN 1 END")), 'paid_count'],
                [sequelize.literal('CASE WHEN SUM(total_price) > 0 THEN ROUND((SUM(amount_paid) / SUM(total_price)) * 100, 1) ELSE 0 END'), 'collection_rate']
            ],
            where: whereClause,
            raw: true
        });

        res.json({
            ok: true,
            summary: summary || {}
        });
    } catch (error) {
        console.error('Error getting financial summary:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener resumen financiero'
        });
    }
};

// Obtener datos para gráfico de ingresos
export const getRevenueChart = async (req, res) => {
    try {
        const { startDate, endDate, period = 'daily', filterBy = 'created_at' } = req.query;
        
        // Si no hay fechas, usar todos los datos
        let whereClause = { status: { [Op.ne]: 'cancelled' } };
        if (startDate && endDate) {
            whereClause[filterBy] = { [Op.between]: [startDate, endDate] };
        }
        
        let periodFormat, groupBy;
        
        if (period === 'weekly') {
            periodFormat = sequelize.literal(`DATE_TRUNC('week', ${filterBy})`);
            groupBy = [sequelize.literal(`DATE_TRUNC('week', ${filterBy})`)];
        } else if (period === 'monthly') {
            periodFormat = sequelize.literal(`DATE_TRUNC('month', ${filterBy})`);
            groupBy = [sequelize.literal(`DATE_TRUNC('month', ${filterBy})`)];
        } else {
            periodFormat = sequelize.fn('DATE', sequelize.col(filterBy));
            groupBy = [sequelize.fn('DATE', sequelize.col(filterBy))];
        }
        
        const chartData = await Reservation.findAll({
            attributes: [
                [periodFormat, 'period'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'reservations'],
                [sequelize.fn('SUM', sequelize.col('total_price')), 'revenue'],
                [sequelize.fn('SUM', sequelize.col('amount_paid')), 'paid'],
                [sequelize.fn('SUM', sequelize.literal('total_price - amount_paid')), 'pending']
            ],
            where: whereClause,
            group: groupBy,
            order: [[periodFormat, 'ASC']],
            raw: true
        });

        // Formatear fechas para el frontend
        const formattedData = chartData.map(item => {
            let formattedPeriod = item.period;
            
            if (period === 'daily' && item.period) {
                const date = new Date(item.period);
                formattedPeriod = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'weekly' && item.period) {
                const date = new Date(item.period);
                formattedPeriod = `Sem ${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'monthly' && item.period) {
                const date = new Date(item.period);
                const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                formattedPeriod = `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
            }
            
            return {
                period: formattedPeriod,
                revenue: parseFloat(item.revenue) || 0,
                reservations: parseInt(item.reservations) || 0,
                paid: parseFloat(item.paid) || 0,
                pending: parseFloat(item.pending) || 0
            };
        });

        res.json({
            ok: true,
            chartData: formattedData
        });
    } catch (error) {
        console.error('Error getting revenue chart:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener datos del gráfico'
        });
    }
};

// Obtener pagos pendientes
export const getPendingPayments = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const pendingPayments = await Reservation.findAndCountAll({
            attributes: [
                'id', 'guest_name', 'guest_phone', 'total_price', 
                'amount_paid', 'created_at', 'check_in', 'status',
                [sequelize.literal('total_price - amount_paid'), 'pending_amount']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone', 'is_guest'],
                required: false
            }],
            where: {
                [Op.and]: [
                    sequelize.literal('amount_paid < total_price'),
                    { status: { [Op.ne]: 'cancelled' } }
                ]
            },
            order: [
                [sequelize.literal('total_price - amount_paid'), 'DESC'],
                ['created_at', 'ASC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            ok: true,
            pendingPayments: pendingPayments.rows,
            total: pendingPayments.count
        });
    } catch (error) {
        console.error('Error getting pending payments:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener pagos pendientes'
        });
    }
};

// Obtener estadísticas de métodos de pago
export const getPaymentMethods = async (req, res) => {
    try {
        const { startDate, endDate, filterBy = 'created_at' } = req.query;

        const whereClause = { 
            status: { [Op.ne]: 'cancelled' },
            amount_paid: { [Op.gt]: 0 }
        };
        if (startDate && endDate) {
            whereClause[filterBy] = { [Op.between]: [startDate, endDate] };
        }

        const paymentMethods = await Reservation.findAll({
            attributes: [
                'payment_method',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_amount'],
                [sequelize.fn('AVG', sequelize.col('amount_paid')), 'avg_amount']
            ],
            where: whereClause,
            group: ['payment_method'],
            order: [[sequelize.fn('SUM', sequelize.col('amount_paid')), 'DESC']],
            raw: true
        });

        res.json({
            ok: true,
            paymentMethods
        });
    } catch (error) {
        console.error('Error getting payment methods:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener métodos de pago'
        });
    }
};

// Obtener estadísticas por cabaña
export const getCabinStats = async (req, res) => {
    try {
        const { startDate, endDate, filterBy = 'created_at' } = req.query;

        const whereClause = { status: { [Op.ne]: 'cancelled' } };
        if (startDate && endDate) {
            whereClause[filterBy] = { [Op.between]: [startDate, endDate] };
        }

        const cabinStats = await Reservation.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('reservations.id')), 'reservations'],
                [sequelize.fn('SUM', sequelize.col('reservations.total_price')), 'revenue'],
                [sequelize.fn('AVG', sequelize.col('reservations.total_price')), 'avg_price']
            ],
            include: [{
                model: Cabin,
                as: 'cabin',
                attributes: ['name'],
                required: true
            }],
            where: whereClause,
            group: ['reservations.cabin_id', 'cabin.id', 'cabin.name'],
            order: [[sequelize.fn('SUM', sequelize.col('reservations.total_price')), 'DESC']],
            raw: false
        });

        res.json({
            ok: true,
            cabinStats
        });
    } catch (error) {
        console.error('Error getting cabin stats:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener estadísticas por cabaña'
        });
    }
};