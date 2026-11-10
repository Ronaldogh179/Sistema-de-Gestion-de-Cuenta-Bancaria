import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db.js';
import Cuenta from './src/models/Cuenta.js';

const cuentasDemo = [
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000001'),
    numeroCuenta: '001-100001',
    titular: 'Ana Torres',
    saldoCents: 500000,
  },
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000002'),
    numeroCuenta: '001-100002',
    titular: 'Luis Ramírez',
    saldoCents: 275050,
  },
  {
    _id: new mongoose.Types.ObjectId('650000000000000000000003'),
    numeroCuenta: '001-100003',
    titular: 'María Fernández',
    saldoCents: 120000,
  },
];

const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

async function sembrar() {
  try {
    await connectDB();

    for (const cuenta of cuentasDemo) {
      const guardada = await Cuenta.findOneAndUpdate(
        { _id: cuenta._id },
        { $setOnInsert: cuenta },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      console.log(
        `Cuenta ${guardada.numeroCuenta} - ${guardada.titular}: ` +
          `${formatoMoneda.format(guardada.saldoCents / 100)} ` +
          `(_id: ${guardada._id})`
      );
    }

    console.log('\nSeed ejecutado correctamente (idempotente).');
    console.log('Los saldos existentes no se sobrescriben al repetir el seed.');
  } catch (error) {
    console.error('Error al ejecutar el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

sembrar();
