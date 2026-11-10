import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  const hello = await mongoose.connection.db.admin().command({ hello: 1 });

  if (!hello.setName) {
    console.warn(
      '\n[ADVERTENCIA] MongoDB no está configurado como replica set. ' +
        'Las operaciones con transacciones fallarán.\n' +
        'Ejecuta `npm run mongo:setup` dentro de server/ para iniciar una ' +
        'instancia local con replica set de un solo nodo.\n'
    );
  } else {
    console.log(`MongoDB conectado (replica set: ${hello.setName}).`);
  }

  return { setName: hello.setName || null };
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
