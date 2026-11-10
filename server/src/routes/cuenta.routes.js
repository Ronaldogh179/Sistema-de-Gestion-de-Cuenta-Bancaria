import { Router } from 'express';
import {
  consultarCuenta,
  consultarHistorial,
  realizarDeposito,
  realizarRetiro,
  realizarTransferencia,
} from '../controllers/cuenta.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/:id/historial', asyncHandler(consultarHistorial));
router.get('/:id', asyncHandler(consultarCuenta));
router.post('/deposito', asyncHandler(realizarDeposito));
router.post('/retiro', asyncHandler(realizarRetiro));
router.post('/transferencia', asyncHandler(realizarTransferencia));

export default router;
