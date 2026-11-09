import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarBD } from './config/database.js';
import { Cuenta } from './models/Cuenta.js';

const cuentasIniciales = [
  { numero: 'CTA-1001', titular: 'Alex Rivera', moneda: 'PEN', saldoCentavos: 1250750 },
  { numero: 'CTA-1002', titular: 'María Flores', moneda: 'PEN', saldoCentavos: 875000 },
  { numero: 'CTA-1003', titular: 'Diego Torres', moneda: 'PEN', saldoCentavos: 342025 },
  { numero: 'CTA-1004', titular: 'Ana Rojas', moneda: 'PEN', saldoCentavos: 510050 }
];
try {
  await conectarBD(process.env.MONGODB_URI || 'mongodb://mongo:27017/cuenta_bancaria?replicaSet=rs0&directConnection=true');
  for (const cuenta of cuentasIniciales) {
    await Cuenta.updateOne({ numero: cuenta.numero }, { $setOnInsert: cuenta }, { upsert: true });
  }
  console.log('Cuentas de demostración verificadas (sin sobrescribir saldos existentes):');
  cuentasIniciales.forEach(({ numero, titular }) => console.log(`${numero}: ${titular}`));
} catch (error) {
  console.error('Error en seed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
