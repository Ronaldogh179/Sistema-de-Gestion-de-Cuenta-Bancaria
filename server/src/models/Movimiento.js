import mongoose from 'mongoose';
const movimientoSchema = new mongoose.Schema({
  tipo: { type: String, required: true, enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'] },
  montoCentavos: { type: Number, required: true, min: 1 },
  cuentaOrigen: { type: String, default: null },
  cuentaDestino: { type: String, default: null },
  fecha: { type: Date, default: Date.now, index: true }
}, { versionKey: false });
movimientoSchema.index({ cuentaOrigen: 1, fecha: -1 });
movimientoSchema.index({ cuentaDestino: 1, fecha: -1 });
export const Movimiento = mongoose.model('Movimiento', movimientoSchema);
