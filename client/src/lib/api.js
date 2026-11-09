export async function api(ruta, opciones = {}) {
  let response;
  try {
    response = await fetch(`/api${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
      ...(opciones.body && typeof opciones.body !== 'string'
        ? { body: JSON.stringify(opciones.body) }
        : {})
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API y MongoDB estén activos.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
  return data;
}
