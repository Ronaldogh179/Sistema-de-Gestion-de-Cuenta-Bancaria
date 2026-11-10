import mongoose from 'mongoose';
import Cuenta from '../models/Cuenta.js';
import Movimiento from '../models/Movimiento.js';
import { ApiError } from '../utils/ApiError.js';
import { validarMontoCents, validarObjectId } from '../utils/validaciones.js';

async function ejecutarEnTransaccion(work) {
  const session = await mongoose.startSession();

  try {
    let resultado;
    await session.withTransaction(async () => {
      resultado = await work(session);
    });
    return resultado;
  } finally {
    await session.endSession();
  }
}

export async function obtenerCuenta(cuentaId) {
  validarObjectId(cuentaId, 'id');

  const cuenta = await Cuenta.findById(cuentaId).lean();

  if (!cuenta) {
    throw new ApiError(404, 'Cuenta no encontrada.');
  }

  return cuenta;
}

export async function obtenerHistorial(cuentaId) {
  validarObjectId(cuentaId, 'id');

  const cuenta = await Cuenta.findById(cuentaId).lean();

  if (!cuenta) {
    throw new ApiError(404, 'Cuenta no encontrada.');
  }

  const movimientos = await Movimiento.find({
    $or: [{ cuentaOrigen: cuentaId }, { cuentaDestino: cuentaId }],
  })
    .sort({ fecha: -1, _id: -1 })
    .populate('cuentaOrigen', 'numeroCuenta titular')
    .populate('cuentaDestino', 'numeroCuenta titular')
    .lean();

  return { cuenta, movimientos };
}

export async function depositar({ cuentaId, montoCents }) {
  validarObjectId(cuentaId, 'cuentaId');
  validarMontoCents(montoCents);

  return ejecutarEnTransaccion(async (session) => {
    const cuenta = await Cuenta.findByIdAndUpdate(
      cuentaId,
      { $inc: { saldoCents: montoCents } },
      { returnDocument: 'after', session }
    );

    if (!cuenta) {
      throw new ApiError(404, 'Cuenta no encontrada.');
    }

    const [movimiento] = await Movimiento.create(
      [
        {
          tipo: 'deposito',
          montoCents,
          cuentaDestino: cuenta._id,
        },
      ],
      { session }
    );

    return { cuenta, movimiento };
  });
}

export async function retirar({ cuentaId, montoCents }) {
  validarObjectId(cuentaId, 'cuentaId');
  validarMontoCents(montoCents);

  return ejecutarEnTransaccion(async (session) => {
    const cuenta = await Cuenta.findOneAndUpdate(
      { _id: cuentaId, saldoCents: { $gte: montoCents } },
      { $inc: { saldoCents: -montoCents } },
      { returnDocument: 'after', session }
    );

    if (!cuenta) {
      const existe = await Cuenta.exists({ _id: cuentaId }).session(session);

      if (!existe) {
        throw new ApiError(404, 'Cuenta no encontrada.');
      }

      throw new ApiError(400, 'Saldo insuficiente para realizar el retiro.');
    }

    const [movimiento] = await Movimiento.create(
      [
        {
          tipo: 'retiro',
          montoCents,
          cuentaOrigen: cuenta._id,
        },
      ],
      { session }
    );

    return { cuenta, movimiento };
  });
}

export async function transferir({
  cuentaOrigenId,
  cuentaDestinoId,
  montoCents,
}) {
  validarObjectId(cuentaOrigenId, 'cuentaOrigenId');
  validarObjectId(cuentaDestinoId, 'cuentaDestinoId');
  validarMontoCents(montoCents);

  if (cuentaOrigenId === cuentaDestinoId) {
    throw new ApiError(
      400,
      'La cuenta de origen y destino deben ser diferentes.'
    );
  }

  return ejecutarEnTransaccion(async (session) => {
    const destinoExiste = await Cuenta.exists({
      _id: cuentaDestinoId,
    }).session(session);

    if (!destinoExiste) {
      throw new ApiError(404, 'Cuenta de destino no encontrada.');
    }

    const cuentaOrigen = await Cuenta.findOneAndUpdate(
      { _id: cuentaOrigenId, saldoCents: { $gte: montoCents } },
      { $inc: { saldoCents: -montoCents } },
      { returnDocument: 'after', session }
    );

    if (!cuentaOrigen) {
      const origenExiste = await Cuenta.exists({
        _id: cuentaOrigenId,
      }).session(session);

      if (!origenExiste) {
        throw new ApiError(404, 'Cuenta de origen no encontrada.');
      }

      throw new ApiError(
        400,
        'Saldo insuficiente para realizar la transferencia.'
      );
    }

    const cuentaDestino = await Cuenta.findByIdAndUpdate(
      cuentaDestinoId,
      { $inc: { saldoCents: montoCents } },
      { returnDocument: 'after', session }
    );

    if (!cuentaDestino) {
      throw new ApiError(404, 'Cuenta de destino no encontrada.');
    }

    const [movimiento] = await Movimiento.create(
      [
        {
          tipo: 'transferencia',
          montoCents,
          cuentaOrigen: cuentaOrigen._id,
          cuentaDestino: cuentaDestino._id,
        },
      ],
      { session }
    );

    return { cuentaOrigen, cuentaDestino, movimiento };
  });
}
