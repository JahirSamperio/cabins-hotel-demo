import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import conexion from '../config/database.js';
import routes from '../routes/routes.js'
import bodyParser from 'body-parser';
import '../models/associations.js'; // Importar asociaciones

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        //conectar base de datos
        this.conectarBD();

        //Cron jobs para actualizar estados
        // actualizarEstados();

        //Middlewares
        this.middlewares();
        
        //Rutas de mi aplicacion
        this.routes();
    }

    async conectarBD(){
        try {
            await conexion.authenticate();
            // conexion.sync();
            console.log('Base de datos en linea');
        } catch(error){
            console.error('Error conectando a la base de datos:', error);
            throw error;
        }
    }
    middlewares() {
        //CORS
        this.app.use(cors());

        //Lectura y parseo del body con limite para imagenes
        this.app.use(express.json({limit: '50mb'}));
        this.app.use(express.urlencoded({limit: '50mb', extended: true}));

        //Habilitar cookie parser
        this.app.use(cookieParser());


    }

    routes() {
        this.app.use(routes);
    }

    listen() {
        const server = this.app.listen(this.port, () =>{
            console.log('Servidor corriendo en el puerto', this.port);
        });
        
        server.on('error', (error) => {
            console.error('Error iniciando servidor:', error);
            process.exit(1);
        });
    }
}

export default Server;