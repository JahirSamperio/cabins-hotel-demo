import { DataTypes } from 'sequelize';
import conexion from '../config/database.js';

const Review = conexion.define('reviews', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reservation_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'reservations',
            key: 'id'
        }
    },
    cabin_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'cabins',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default Review;