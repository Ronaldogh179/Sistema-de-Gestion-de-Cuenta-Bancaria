import mongoose from 'mongoose';
import { Cuenta } from '../models/Cuenta.js';
import { Movimiento } from '../models/Movimiento.js';
import { HttpError } from '../utils/httpError.js';
import { parseMonto } from '../utils/money.js';

function numeroCuenta(valor, campo = 'cuentaId') {
  if (typeof valor !== 'string' || !/^CTA-[0-9]{4,10}$/.test(valor.trim())) {
    throw new HttpError(400, `${campo} debe tener formato CTA-1001.`);
  }
  return valor.trim();
}

export function serializarCuenta(cuenta) {
  return {
    id: cuenta.numero,
    numero: cuenta.numero,
    titular: cuenta.titular,
    moneda: cuenta.moneda,
    saldo: (cuenta.saldoCentavos / 100).toFixed(2)
  };
}
export function serializarMovimiento(movimiento) {
  return {
    id: String(movimiento._id), tipo: movimiento.tipo,
    monto: (movimiento.montoCentavos / 100).toFixed(2),
    fecha: movimiento.fecha,
    cuentaOrigen: movimiento.cuentaOrigen,
    cuentaDestino: movimiento.cuentaDestino
  };
}

export async function listarCuentas() {
  const cuentas = await Cuenta.find({}).sort({ numero: 1 }).lean();
  return cuentas.map(serializarCuenta);
}
export async function obtenerCuenta(numero) {
  numero = numeroCuenta(numero, 'id');
  const cuenta = await Cuenta.findOne({ numero }).lean();
  if (!cuenta) throw new HttpError(404, 'Cuenta no encontrada.');
  return serializarCuenta(cuenta);
}

export async function depositar({ cuentaId, monto }) {
  const numero = numeroCuenta(cuentaId);
  const centavos = parseMonto(monto);
  return mongoose.connection.transaction(async (session) => {
    const cuenta = await Cuenta.findOneAndUpdate(
      { numero }, { $inc: { saldoCentavos: centavos } },
      { session, new: true, runValidators: true }
    );
    if (!cuenta) throw new HttpError(404, 'Cuenta no encontrada.');
    const [movimiento] = await Movimiento.create([{
      tipo: 'DEPOSITO', montoCentavos: centavos, cuentaDestino: numero
    }], { session });
    return { cuenta: serializarCuenta(cuenta), movimiento: serializarMovimiento(movimiento) };
  });
}

export async function retirar({ cuentaId, monto }) {
  const numero = numeroCuenta(cuentaId);
  const centavos = parseMonto(monto);
  return mongoose.connection.transaction(async (session) => {
    const cuenta = await Cuenta.findOneAndUpdate(
      { numero, saldoCentavos: { $gte: centavos } },
      { $inc: { saldoCentavos: -centavos } },
      { session, new: true, runValidators: true }
    );
    if (!cuenta) {
      const existe = await Cuenta.exists({ numero }).session(session);
      throw new HttpError(existe ? 400 : 404, existe ? 'Saldo insuficiente.' : 'Cuenta no encontrada.');
    }
    const [movimiento] = await Movimiento.create([{
      tipo: 'RETIRO', montoCentavos: centavos, cuentaOrigen: numero
    }], { session });
    return { cuenta: serializarCuenta(cuenta), movimiento: serializarMovimiento(movimiento) };
  });
}

export async function transferir({ cuentaOrigen, cuentaDestino, monto }) {
  const origen = numeroCuenta(cuentaOrigen, 'cuentaOrigen');
  const destino = numeroCuenta(cuentaDestino, 'cuentaDestino');
  if (origen === destino) throw new HttpError(400, 'No se puede transferir a la misma cuenta.');
  const centavos = parseMonto(monto);
  return mongoose.connection.transaction(async (session) => {
    // Verificar destino ANTES de descontar. La transacción revierte todo ante fallos.
    const destinoExiste = await Cuenta.exists({ numero: destino }).session(session);
    if (!destinoExiste) throw new HttpError(404, 'La cuenta destino no existe.');
    const cuentaOrigenActualizada = await Cuenta.findOneAndUpdate(
      { numero: origen, saldoCentavos: { $gte: centavos } },
      { $inc: { saldoCentavos: -centavos } },
      { session, new: true, runValidators: true }
    );
    if (!cuentaOrigenActualizada) {
      const existe = await Cuenta.exists({ numero: origen }).session(session);
      throw new HttpError(existe ? 400 : 404, existe ? 'Saldo insuficiente.' : 'Cuenta origen no encontrada.');
    }
    const cuentaDestinoActualizada = await Cuenta.findOneAndUpdate(
      { numero: destino }, { $inc: { saldoCentavos: centavos } },
      { session, new: true, runValidators: true }
    );
    if (!cuentaDestinoActualizada) throw new HttpError(404, 'La cuenta destino ya no existe.');
    const [movimiento] = await Movimiento.create([{
      tipo: 'TRANSFERENCIA', montoCentavos: centavos,
      cuentaOrigen: origen, cuentaDestino: destino
    }], { session });
    return {
      cuenta: serializarCuenta(cuentaOrigenActualizada),
      cuentaDestino: serializarCuenta(cuentaDestinoActualizada),
      movimiento: serializarMovimiento(movimiento)
    };
  });
}

export async function obtenerHistorial(numero) {
  numero = numeroCuenta(numero, 'id');
  if (!await Cuenta.exists({ numero })) throw new HttpError(404, 'Cuenta no encontrada.');
  const movimientos = await Movimiento.find({
    $or: [{ cuentaOrigen: numero }, { cuentaDestino: numero }]
  }).sort({ fecha: -1, _id: -1 }).limit(50).lean();
  return movimientos.map(serializarMovimiento);
}
