import mongoose from 'mongoose';
const cuentaSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true, trim: true },
  titular: { type: String, required: true, trim: true },
  moneda: { type: String, default: 'PEN', enum: ['PEN'] },
  saldoCentavos: { type: Number, required: true, min: 0, default: 0 }
}, { timestamps: true, versionKey: false });
export const Cuenta = mongoose.model('Cuenta', cuentaSchema);
