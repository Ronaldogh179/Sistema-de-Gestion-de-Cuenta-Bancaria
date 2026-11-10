import mongoose from 'mongoose';

const cuentaSchema = new mongoose.Schema(
  {
    numeroCuenta: {
      type: String,
      required: [true, 'El número de cuenta es obligatorio.'],
      unique: true,
      trim: true,
    },
    titular: {
      type: String,
      required: [true, 'El titular es obligatorio.'],
      trim: true,
    },
    saldoCents: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El saldo no puede ser negativo.'],
      validate: {
        validator: Number.isSafeInteger,
        message: 'El saldo debe expresarse en céntimos enteros.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('Cuenta', cuentaSchema);
