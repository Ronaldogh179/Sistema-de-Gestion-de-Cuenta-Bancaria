import * as operaciones from '../services/operaciones.service.js';
import { asyncHandler } from '../utils/httpError.js';

export const listar = asyncHandler(async (_req, res) => {
  res.json({ cuentas: await operaciones.listarCuentas() });
});
export const detalle = asyncHandler(async (req, res) => {
  res.json({ cuenta: await operaciones.obtenerCuenta(req.params.id) });
});
export const deposito = asyncHandler(async (req, res) => {
  res.status(201).json({ mensaje: 'Depósito realizado.', ...await operaciones.depositar(req.body ?? {}) });
});
export const retiro = asyncHandler(async (req, res) => {
  res.status(201).json({ mensaje: 'Retiro realizado.', ...await operaciones.retirar(req.body ?? {}) });
});
export const transferencia = asyncHandler(async (req, res) => {
  res.status(201).json({ mensaje: 'Transferencia realizada.', ...await operaciones.transferir(req.body ?? {}) });
});
export const historial = asyncHandler(async (req, res) => {
  res.json({ movimientos: await operaciones.obtenerHistorial(req.params.id) });
});
