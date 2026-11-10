import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ['deposito', 'retiro', 'transferencia'],
    },
    montoCents: {
      type: Number,
      required: true,
      min: [1, 'El monto debe ser mayor a cero.'],
      validate: {
        validator: Number.isSafeInteger,
        message: 'El monto debe expresarse en céntimos enteros.',
      },
    },
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },
    cuentaOrigen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      default: null,
    },
    cuentaDestino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

movimientoSchema.index({ cuentaOrigen: 1, fecha: -1 });
movimientoSchema.index({ cuentaDestino: 1, fecha: -1 });

export default mongoose.model('Movimiento', movimientoSchema);
