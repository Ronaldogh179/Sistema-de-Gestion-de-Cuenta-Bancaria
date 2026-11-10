import * as cuentaService from '../services/cuenta.service.js';

export async function consultarCuenta(req, res) {
  const cuenta = await cuentaService.obtenerCuenta(req.params.id);
  res.json({ cuenta });
}

export async function consultarHistorial(req, res) {
  const { cuenta, movimientos } = await cuentaService.obtenerHistorial(
    req.params.id
  );
  res.json({ cuenta, movimientos });
}

export async function realizarDeposito(req, res) {
  const { cuentaId, montoCents } = req.body;
  const { cuenta, movimiento } = await cuentaService.depositar({
    cuentaId,
    montoCents,
  });

  res.json({
    mensaje: 'Depósito realizado correctamente.',
    cuenta,
    movimiento,
  });
}

export async function realizarRetiro(req, res) {
  const { cuentaId, montoCents } = req.body;
  const { cuenta, movimiento } = await cuentaService.retirar({
    cuentaId,
    montoCents,
  });

  res.json({
    mensaje: 'Retiro realizado correctamente.',
    cuenta,
    movimiento,
  });
}

export async function realizarTransferencia(req, res) {
  const { cuentaOrigenId, cuentaDestinoId, montoCents } = req.body;
  const { cuentaOrigen, cuentaDestino, movimiento } =
    await cuentaService.transferir({
      cuentaOrigenId,
      cuentaDestinoId,
      montoCents,
    });

  res.json({
    mensaje: 'Transferencia realizada correctamente.',
    cuentaOrigen,
    cuentaDestino,
    movimiento,
  });
}
