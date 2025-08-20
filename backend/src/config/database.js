import Sequelize from "sequelize";
import {config} from 'dotenv';
// Ejecuta la función config() para cargar las variables de entorno desde el archivo .env
config();

const conexion = new Sequelize(process.env.BD_DATABASE, process.env.BD_USER, process.env.BD_PASSWORD, {
    host: process.env.BD_HOST,
    port: process.env.BD_DB_PORT,
    dialect: 'postgres',
    define:{
        timestamps: true, //Agrega createdAt y updatedAt
        freezeTableName: true //Desactiva el pluralizado
    },
    pool: {
        max: 20, //Maximo de conexiones
        min: 5, //Minimo de conexiones
        acquire: 30000, //Tiempo antes de marcar un error 30 seconds
        idle: 10000  //Finaliza la conexion despues de 10 seconds
    },
    operatorAliases: false
});

export default conexion;