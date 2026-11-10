import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function iniciar() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`API escuchando en http://localhost:${env.port}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    const cerrar = async () => {
      console.log('\nCerrando servidor...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', cerrar);
    process.on('SIGTERM', cerrar);
  } catch (error) {
    console.error('No se pudo iniciar la aplicación.');
    console.error(error.message);
    console.error(
      'Verifica que MongoDB esté disponible en MONGODB_URI y que sea un replica set.'
    );
    process.exit(1);
  }
}

iniciar();
