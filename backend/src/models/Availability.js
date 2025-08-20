import { DataTypes } from 'sequelize';
import conexion from '../config/database.js';

const Availability = conexion.define('availability', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cabin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'cabins',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    price_override: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['cabin_id', 'date']
        }
    ]
});

export default Availability;