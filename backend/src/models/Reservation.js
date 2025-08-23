import { DataTypes } from 'sequelize';
import conexion from '../config/database.js';

const Reservation = conexion.define('reservations', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    cabin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'cabins',
            key: 'id'
        }
    },
    check_in: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    check_out: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    guests: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending'
    },
    booking_type: {
        type: DataTypes.ENUM('online', 'walk_in', 'phone'),
        defaultValue: 'online'
    },
    created_by_admin: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    guest_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    guest_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    payment_method: {
        type: DataTypes.ENUM('online', 'cash', 'card', 'transfer'),
        defaultValue: 'online'
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'partial'),
        defaultValue: 'pending'
    },
    special_requests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
    },
    includes_breakfast: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Reservation;