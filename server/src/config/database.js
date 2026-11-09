import mongoose from 'mongoose';
import { Cuenta } from '../models/Cuenta.js';
import { Movimiento } from '../models/Movimiento.js';

export async function conectarBD(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('Falta MONGODB_URI en el entorno.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  // Crear las colecciones e índices antes de cualquier transacción.
  await Promise.all([Cuenta.init(), Movimiento.init()]);
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}
