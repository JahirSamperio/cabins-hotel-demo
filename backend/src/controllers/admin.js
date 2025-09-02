import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Reservation from '../models/Reservation.js';
import Cabin from '../models/Cabin.js';
import Review from '../models/Review.js';

// Función para obtener fecha en zona horaria de México
const getMexicoDate = () => {
    const mexicoTime = new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City"});
    return new Date(mexicoTime);
};

// Función para obtener fecha de México como string YYYY-MM-DD
const getMexicoDateString = () => {
    const now = new Date();
    const mexicoDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
    const year = mexicoDate.getFullYear();
    const month = String(mexicoDate.getMonth() + 1).padStart(2, '0');
    const day = String(mexicoDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Obtener estadísticas optimizadas del dashboard
export const getStats = async (req, res) => {
    try {
        // Usar zona horaria de Ciudad de México
        const today = getMexicoDate();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const todayStr = getMexicoDateString();

        


        
        // Consultas optimizadas en paralelo
        const [monthlyStats, monthlyStaysStats, lastMonthStats, todayStats, cabinStats, reviewStats, allPendingStats] = await Promise.all([
            // Estadísticas del mes actual (reservaciones creadas)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReservations'],
                    [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
                    [sequelize.fn('SUM', sequelize.col('amount_paid')), 'totalPaid'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")), 'pendingReservations'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN includes_breakfast = true THEN 1 END")), 'withBreakfast']
                ],
                where: {
                    created_at: { [Op.between]: [startOfMonth, endOfMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas de estadías del mes (check-ins)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalStays']
                ],
                where: {
                    check_in: { [Op.between]: [startOfMonth, endOfMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas del mes pasado para comparación
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReservations'],
                    [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
                ],
                where: {
                    created_at: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas de hoy excluyendo canceladas
            sequelize.query(`
                SELECT 
                    COUNT(CASE WHEN check_in = CAST('${todayStr}' AS DATE) AND status != 'cancelled' THEN 1 END) as "checkInsToday",
                    COUNT(CASE WHEN check_out = CAST('${todayStr}' AS DATE) AND status != 'cancelled' THEN 1 END) as "checkOutsToday",
                    COUNT(CASE WHEN check_in <= CAST('${todayStr}' AS DATE) 
                                AND check_out >= CAST('${todayStr}' AS DATE) 
                                AND status = 'confirmed' THEN 1 END) as "occupiedToday"
                FROM reservations
            `, { type: sequelize.QueryTypes.SELECT }),
            
            // Estadísticas de cabañas
            Cabin.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalCabins']
                ],
                raw: true
            }),
            
            // Estadísticas de reviews
            Review.findAll({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
                ],
                raw: true
            }),
            
            // Todas las reservaciones pendientes (sin filtro de fecha)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'pendingReservations']
                ],
                where: {
                    status: 'pending'
                },
                raw: true
            })
        ]);
        
        const currentMonth = monthlyStats[0] || {};
        const currentMonthStays = monthlyStaysStats[0] || {};
        const lastMonth = lastMonthStats[0] || {};
        const todayData = todayStats[0] || {};
        const cabins = cabinStats[0] || {};
        const reviews = reviewStats[0] || {};
        const allPending = allPendingStats[0] || {};
        
        // Calcular porcentajes de cambio
        const revenueChange = lastMonth.totalRevenue > 0 
            ? Math.round(((currentMonth.totalRevenue - lastMonth.totalRevenue) / lastMonth.totalRevenue) * 100)
            : 0;
            
        const reservationsChange = lastMonth.totalReservations > 0
            ? Math.round(((currentMonth.totalReservations - lastMonth.totalReservations) / lastMonth.totalReservations) * 100)
            : 0;
        
        const occupancyRate = cabins.totalCabins > 0 
            ? Math.round((todayData.occupiedToday / cabins.totalCabins) * 100) 
            : 0;
            
        const availableCabins = cabins.totalCabins - todayData.occupiedToday;
        
        res.json({
            ok: true,
            stats: {
                // Métricas principales
                monthlyRevenue: parseFloat(currentMonth.totalRevenue) || 0,
                revenueChange,
                monthlyReservations: parseInt(currentMonth.totalReservations) || 0,
                monthlyStays: parseInt(currentMonthStays.totalStays) || 0,
                reservationsChange,
                occupancyRate,
                availableCabins: parseInt(availableCabins) || 0,
                
                // Métricas de hoy
                checkInsToday: parseInt(todayData.checkInsToday) || 0,
                checkOutsToday: parseInt(todayData.checkOutsToday) || 0,
                
                // Métricas de gestión
                pendingReservations: parseInt(allPending.pendingReservations) || 0,
                pendingPayments: parseFloat(currentMonth.totalRevenue - currentMonth.totalPaid) || 0,
                
                // Métricas de servicio
                averageRating: parseFloat(reviews.averageRating) || 0,
                pendingReviews: 0, // No hay columna approved en el esquema actual
                breakfastPercentage: currentMonth.totalReservations > 0 
                    ? Math.round((currentMonth.withBreakfast / currentMonth.totalReservations) * 100)
                    : 0,
                    
                // Totales
                totalCabins: parseInt(cabins.totalCabins) || 0,
                totalReviews: parseInt(reviews.totalReviews) || 0,
                
                // Info de debug
                currentDate: today.toLocaleDateString('es-MX'),
                currentTime: today.toLocaleTimeString('es-MX')
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener estadísticas'
        });
    }
};

// Obtener reservaciones recientes
export const getRecentBookings = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Cabin,
                    as: 'cabin',
                    attributes: ['name']
                }
            ],
            attributes: ['id', 'guest_name', 'status', 'check_in', 'check_out', 'total_price', 'created_at']
        });

        res.json({
            ok: true,
            reservations
        });
    } catch (error) {
        console.error('Error getting recent bookings:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener reservaciones recientes'
        });
    }
};

// Obtener datos completos del dashboard (stats + reservaciones recientes)
export const getDashboardData = async (req, res) => {
    try {
        // Usar zona horaria de Ciudad de México
        const today = getMexicoDate();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const todayStr = getMexicoDateString();

        // Consultas optimizadas en paralelo (stats + reservaciones recientes)
        const [monthlyStats, monthlyStaysStats, lastMonthStats, todayStats, cabinStats, reviewStats, allPendingStats, recentReservations] = await Promise.all([
            // Estadísticas del mes actual (reservaciones creadas)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReservations'],
                    [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
                    [sequelize.fn('SUM', sequelize.col('amount_paid')), 'totalPaid'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")), 'pendingReservations'],
                    [sequelize.fn('COUNT', sequelize.literal("CASE WHEN includes_breakfast = true THEN 1 END")), 'withBreakfast']
                ],
                where: {
                    created_at: { [Op.between]: [startOfMonth, endOfMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas de estadías del mes (check-ins)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalStays']
                ],
                where: {
                    check_in: { [Op.between]: [startOfMonth, endOfMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas del mes pasado para comparación
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReservations'],
                    [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
                ],
                where: {
                    created_at: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
                    status: { [Op.ne]: 'cancelled' }
                },
                raw: true
            }),
            
            // Estadísticas de hoy excluyendo canceladas
            sequelize.query(`
                SELECT 
                    COUNT(CASE WHEN check_in = CAST('${todayStr}' AS DATE) AND status != 'cancelled' THEN 1 END) as "checkInsToday",
                    COUNT(CASE WHEN check_out = CAST('${todayStr}' AS DATE) AND status != 'cancelled' THEN 1 END) as "checkOutsToday",
                    COUNT(CASE WHEN check_in <= CAST('${todayStr}' AS DATE) 
                                AND check_out >= CAST('${todayStr}' AS DATE) 
                                AND status = 'confirmed' THEN 1 END) as "occupiedToday"
                FROM reservations
            `, { type: sequelize.QueryTypes.SELECT }),
            
            // Estadísticas de cabañas
            Cabin.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalCabins']
                ],
                raw: true
            }),
            
            // Estadísticas de reviews
            Review.findAll({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
                ],
                raw: true
            }),
            
            // Todas las reservaciones pendientes (sin filtro de fecha)
            Reservation.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'pendingReservations']
                ],
                where: {
                    status: 'pending'
                },
                raw: true
            }),
            
            // Reservaciones recientes
            Reservation.findAll({
                limit: 10,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Cabin,
                        as: 'cabin',
                        attributes: ['name']
                    }
                ],
                attributes: ['id', 'guest_name', 'status', 'check_in', 'check_out', 'total_price', 'created_at']
            })
        ]);
        
        const currentMonth = monthlyStats[0] || {};
        const currentMonthStays = monthlyStaysStats[0] || {};
        const lastMonth = lastMonthStats[0] || {};
        const todayData = todayStats[0] || {};
        const cabins = cabinStats[0] || {};
        const reviews = reviewStats[0] || {};
        const allPending = allPendingStats[0] || {};
        
        // Calcular porcentajes de cambio
        const revenueChange = lastMonth.totalRevenue > 0 
            ? Math.round(((currentMonth.totalRevenue - lastMonth.totalRevenue) / lastMonth.totalRevenue) * 100)
            : 0;
            
        const reservationsChange = lastMonth.totalReservations > 0
            ? Math.round(((currentMonth.totalReservations - lastMonth.totalReservations) / lastMonth.totalReservations) * 100)
            : 0;
        
        const occupancyRate = cabins.totalCabins > 0 
            ? Math.round((todayData.occupiedToday / cabins.totalCabins) * 100) 
            : 0;
            
        const availableCabins = cabins.totalCabins - todayData.occupiedToday;
        
        res.json({
            ok: true,
            stats: {
                // Métricas principales
                monthlyRevenue: parseFloat(currentMonth.totalRevenue) || 0,
                revenueChange,
                monthlyReservations: parseInt(currentMonth.totalReservations) || 0,
                monthlyStays: parseInt(currentMonthStays.totalStays) || 0,
                reservationsChange,
                occupancyRate,
                availableCabins: parseInt(availableCabins) || 0,
                
                // Métricas de hoy
                checkInsToday: parseInt(todayData.checkInsToday) || 0,
                checkOutsToday: parseInt(todayData.checkOutsToday) || 0,
                
                // Métricas de gestión
                pendingReservations: parseInt(allPending.pendingReservations) || 0,
                pendingPayments: parseFloat(currentMonth.totalRevenue - currentMonth.totalPaid) || 0,
                
                // Métricas de servicio
                averageRating: parseFloat(reviews.averageRating) || 0,
                pendingReviews: 0, // No hay columna approved en el esquema actual
                breakfastPercentage: currentMonth.totalReservations > 0 
                    ? Math.round((currentMonth.withBreakfast / currentMonth.totalReservations) * 100)
                    : 0,
                    
                // Totales
                totalCabins: parseInt(cabins.totalCabins) || 0,
                totalReviews: parseInt(reviews.totalReviews) || 0,
                
                // Info de debug
                currentDate: today.toLocaleDateString('es-MX'),
                currentTime: today.toLocaleTimeString('es-MX')
            },
            reservations: recentReservations
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener datos del dashboard'
        });
    }
};