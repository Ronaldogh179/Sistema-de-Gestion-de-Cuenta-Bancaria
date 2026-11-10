const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // La respuesta no contenía JSON.
  }

  if (!respuesta.ok) {
    throw new Error(
      datos?.error || `No se pudo completar la solicitud (HTTP ${respuesta.status}).`
    );
  }

  return datos;
}

export function obtenerCuenta(cuentaId) {
  return solicitar(`/cuenta/${cuentaId}`);
}

export function obtenerHistorial(cuentaId) {
  return solicitar(`/cuenta/${cuentaId}/historial`);
}

export function depositar({ cuentaId, montoCents }) {
  return solicitar('/cuenta/deposito', {
    method: 'POST',
    body: JSON.stringify({ cuentaId, montoCents }),
  });
}

export function retirar({ cuentaId, montoCents }) {
  return solicitar('/cuenta/retiro', {
    method: 'POST',
    body: JSON.stringify({ cuentaId, montoCents }),
  });
}

export function transferir({ cuentaOrigenId, cuentaDestinoId, montoCents }) {
  return solicitar('/cuenta/transferencia', {
    method: 'POST',
    body: JSON.stringify({ cuentaOrigenId, cuentaDestinoId, montoCents }),
  });
}
