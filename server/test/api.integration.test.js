import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { crearApp } from '../src/app.js';
import { Cuenta } from '../src/models/Cuenta.js';
import { Movimiento } from '../src/models/Movimiento.js';

const habilitado = process.env.RUN_DB_TESTS === '1';
const uri = process.env.MONGODB_URI_TEST || 'mongodb://mongo:27017/cuenta_bancaria_test?replicaSet=rs0&directConnection=true';

// Nunca borrar accidentalmente una base distinta de las de pruebas.
if (habilitado && !new URL(uri).pathname.split('/').pop()?.endsWith('_test')) {
  throw new Error('MONGODB_URI_TEST debe apuntar a una base terminada en _test.');
}

test('integración real: transferencias atómicas, depósitos, retiros e historial', { skip: !habilitado }, async (t) => {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await Cuenta.create([
    { numero: 'CTA-2001', titular: 'Cuenta origen', saldoCentavos: 10000 },
    { numero: 'CTA-2002', titular: 'Cuenta destino', saldoCentavos: 2000 }
  ]);
  const servidor = crearApp().listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  t.after(async () => {
    await new Promise(resolve => servidor.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  const request = async (ruta, method = 'GET', body) => {
    const res = await fetch(base + ruta, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: res.status, data: await res.json() };
  };
  assert.equal((await request('/api/cuenta/CTA-2001')).data.cuenta.saldo, '100.00');
  assert.equal((await request('/api/cuenta/deposito', 'POST', { cuentaId: 'CTA-2001', monto: '20.50' })).status, 201);
  assert.equal((await request('/api/cuenta/retiro', 'POST', { cuentaId: 'CTA-2001', monto: '10.50' })).status, 201);
  assert.equal((await request('/api/cuenta/retiro', 'POST', { cuentaId: 'CTA-2001', monto: '999.99' })).status, 400);
  assert.equal((await request('/api/cuenta/CTA-2001')).data.cuenta.saldo, '110.00');
  assert.equal((await request('/api/cuenta/transferencia', 'POST', {
    cuentaOrigen: 'CTA-2001', cuentaDestino: 'CTA-2002', monto: '50.00'
  })).status, 201);
  assert.equal((await request('/api/cuenta/CTA-2001')).data.cuenta.saldo, '60.00');
  assert.equal((await request('/api/cuenta/CTA-2002')).data.cuenta.saldo, '70.00');
  assert.equal((await request('/api/cuenta/transferencia', 'POST', {
    cuentaOrigen: 'CTA-2001', cuentaDestino: 'CTA-9999', monto: '10'
  })).status, 404);
  assert.equal((await request('/api/cuenta/transferencia', 'POST', {
    cuentaOrigen: 'CTA-2001', cuentaDestino: 'CTA-2002', monto: '1000.00'
  })).status, 400);
  assert.equal((await request('/api/cuenta/transferencia', 'POST', {
    cuentaOrigen: 'CTA-2001', cuentaDestino: 'CTA-2001', monto: '10.00'
  })).status, 400);
  assert.equal((await request('/api/cuenta/CTA-2001')).data.cuenta.saldo, '60.00');
  assert.equal((await request('/api/cuenta/CTA-9999')).status, 404);
  assert.equal((await request('/api/cuenta/CTA-2001/historial')).data.movimientos.length, 3);
  assert.equal(await Movimiento.countDocuments(), 3);
});
