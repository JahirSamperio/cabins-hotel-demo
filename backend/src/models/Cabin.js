import { DataTypes } from 'sequelize';
import conexion from '../config/database.js';

const Cabin = conexion.define('cabins', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    amenities: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    images: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default Cabin;