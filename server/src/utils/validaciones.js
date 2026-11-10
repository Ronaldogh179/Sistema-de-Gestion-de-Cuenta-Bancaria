import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

export function validarObjectId(valor, campo = 'id') {
  if (!valor || !mongoose.Types.ObjectId.isValid(valor)) {
    throw new ApiError(400, `El campo ${campo} no es un identificador válido.`);
  }
}

export function validarMontoCents(montoCents) {
  if (!Number.isSafeInteger(montoCents) || montoCents <= 0) {
    throw new ApiError(
      400,
      'El monto debe ser un entero positivo expresado en céntimos.'
    );
  }
}
