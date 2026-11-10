import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Cuenta from '../src/models/Cuenta.js';
import Movimiento from '../src/models/Movimiento.js';

const uriTest =
  process.env.MONGODB_URI_TEST ||
  'mongodb://127.0.0.1:27018/cuenta_bancaria_test?replicaSet=rs0';

before(async () => {
  await connectDB(uriTest);
  await mongoose.connection.dropDatabase();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

async function crearCuenta({ titular = 'Titular de prueba', saldoCents = 100000 } = {}) {
  return Cuenta.create({
    numeroCuenta: `TEST-${randomUUID()}`,
    titular,
    saldoCents,
  });
}

test('GET /api/cuenta/:id devuelve el saldo de una cuenta existente', async () => {
  const cuenta = await crearCuenta({ saldoCents: 123456 });

  const respuesta = await request(app).get(`/api/cuenta/${cuenta._id}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.cuenta.saldoCents, 123456);
  assert.equal(respuesta.body.cuenta.numeroCuenta, cuenta.numeroCuenta);
});

test('GET /api/cuenta/:id responde 400 con id inválido y 404 si no existe', async () => {
  const invalido = await request(app).get('/api/cuenta/abc');
  assert.equal(invalido.status, 400);

  const inexistente = await request(app).get(
    `/api/cuenta/${new mongoose.Types.ObjectId()}`
  );
  assert.equal(inexistente.status, 404);
});

test('POST /api/cuenta/deposito rechaza montos inválidos', async () => {
  const cuenta = await crearCuenta();
  const montosInvalidos = [0, -1, 10.5, '100', null];

  for (const montoCents of montosInvalidos) {
    const respuesta = await request(app)
      .post('/api/cuenta/deposito')
      .send({ cuentaId: cuenta._id.toString(), montoCents });

    assert.equal(respuesta.status, 400, `monto ${montoCents} debe ser 400`);
  }

  const sinCuenta = await request(app).post('/api/cuenta/deposito').send({
    cuentaId: new mongoose.Types.ObjectId().toString(),
    montoCents: 100,
  });
  assert.equal(sinCuenta.status, 404);
});

test('POST /api/cuenta/deposito suma el saldo y registra el movimiento', async () => {
  const cuenta = await crearCuenta({ saldoCents: 50000 });

  const respuesta = await request(app)
    .post('/api/cuenta/deposito')
    .send({ cuentaId: cuenta._id.toString(), montoCents: 2500 });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.cuenta.saldoCents, 52500);
  assert.equal(respuesta.body.movimiento.tipo, 'deposito');
  assert.equal(respuesta.body.movimiento.montoCents, 2500);

  const enBD = await Cuenta.findById(cuenta._id);
  assert.equal(enBD.saldoCents, 52500);

  const movimientos = await Movimiento.find({
    cuentaDestino: cuenta._id,
    tipo: 'deposito',
  });
  assert.equal(movimientos.length, 1);
});

test('POST /api/cuenta/retiro impide dejar saldo negativo', async () => {
  const cuenta = await crearCuenta({ saldoCents: 5000 });

  const respuesta = await request(app)
    .post('/api/cuenta/retiro')
    .send({ cuentaId: cuenta._id.toString(), montoCents: 6000 });

  assert.equal(respuesta.status, 400);
  assert.match(respuesta.body.error, /saldo insuficiente/i);

  const enBD = await Cuenta.findById(cuenta._id);
  assert.equal(enBD.saldoCents, 5000);

  const movimientos = await Movimiento.countDocuments({
    cuentaOrigen: cuenta._id,
  });
  assert.equal(movimientos, 0);
});

test('POST /api/cuenta/retiro descuenta el saldo y registra el movimiento', async () => {
  const cuenta = await crearCuenta({ saldoCents: 8000 });

  const respuesta = await request(app)
    .post('/api/cuenta/retiro')
    .send({ cuentaId: cuenta._id.toString(), montoCents: 3000 });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.cuenta.saldoCents, 5000);
  assert.equal(respuesta.body.movimiento.tipo, 'retiro');
  assert.equal(respuesta.body.movimiento.cuentaOrigen.toString(), cuenta._id.toString());
});

test('POST /api/cuenta/transferencia actualiza ambos saldos y registra el movimiento', async () => {
  const origen = await crearCuenta({ saldoCents: 100000 });
  const destino = await crearCuenta({ saldoCents: 20000 });

  const respuesta = await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: origen._id.toString(),
      cuentaDestinoId: destino._id.toString(),
      montoCents: 30000,
    });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.cuentaOrigen.saldoCents, 70000);
  assert.equal(respuesta.body.cuentaDestino.saldoCents, 50000);
  assert.equal(respuesta.body.movimiento.tipo, 'transferencia');
  assert.equal(respuesta.body.movimiento.montoCents, 30000);

  const origenBD = await Cuenta.findById(origen._id);
  const destinoBD = await Cuenta.findById(destino._id);
  assert.equal(origenBD.saldoCents, 70000);
  assert.equal(destinoBD.saldoCents, 50000);

  const movimientoBD = await Movimiento.findById(respuesta.body.movimiento._id);
  assert.equal(movimientoBD.cuentaOrigen.toString(), origen._id.toString());
  assert.equal(movimientoBD.cuentaDestino.toString(), destino._id.toString());
});

test('POST /api/cuenta/transferencia valida origen, destino y saldo', async () => {
  const origen = await crearCuenta({ saldoCents: 10000 });
  const destino = await crearCuenta({ saldoCents: 0 });

  const mismaCuenta = await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: origen._id.toString(),
      cuentaDestinoId: origen._id.toString(),
      montoCents: 100,
    });
  assert.equal(mismaCuenta.status, 400);

  const destinoInexistente = await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: origen._id.toString(),
      cuentaDestinoId: new mongoose.Types.ObjectId().toString(),
      montoCents: 100,
    });
  assert.equal(destinoInexistente.status, 404);

  const origenInexistente = await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: new mongoose.Types.ObjectId().toString(),
      cuentaDestinoId: destino._id.toString(),
      montoCents: 100,
    });
  assert.equal(origenInexistente.status, 404);

  const saldoInsuficiente = await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: origen._id.toString(),
      cuentaDestinoId: destino._id.toString(),
      montoCents: 20000,
    });
  assert.equal(saldoInsuficiente.status, 400);

  const origenBD = await Cuenta.findById(origen._id);
  const destinoBD = await Cuenta.findById(destino._id);
  assert.equal(origenBD.saldoCents, 10000);
  assert.equal(destinoBD.saldoCents, 0);
});

test('GET /api/cuenta/:id/historial devuelve los movimientos de la cuenta', async () => {
  const origen = await crearCuenta({ saldoCents: 50000 });
  const destino = await crearCuenta({ saldoCents: 0 });

  await request(app)
    .post('/api/cuenta/deposito')
    .send({ cuentaId: origen._id.toString(), montoCents: 1000 });
  await request(app)
    .post('/api/cuenta/retiro')
    .send({ cuentaId: origen._id.toString(), montoCents: 500 });
  await request(app)
    .post('/api/cuenta/transferencia')
    .send({
      cuentaOrigenId: origen._id.toString(),
      cuentaDestinoId: destino._id.toString(),
      montoCents: 2000,
    });

  const respuesta = await request(app).get(
    `/api/cuenta/${origen._id}/historial`
  );

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.movimientos.length, 3);

  const tipos = respuesta.body.movimientos.map((movimiento) => movimiento.tipo);
  assert.deepEqual(
    tipos.sort(),
    ['deposito', 'retiro', 'transferencia'].sort()
  );

  const transferencia = respuesta.body.movimientos.find(
    (movimiento) => movimiento.tipo === 'transferencia'
  );
  assert.equal(transferencia.cuentaOrigen.numeroCuenta, origen.numeroCuenta);
  assert.equal(transferencia.cuentaDestino.numeroCuenta, destino.numeroCuenta);

  const inexistente = await request(app).get(
    `/api/cuenta/${new mongoose.Types.ObjectId()}/historial`
  );
  assert.equal(inexistente.status, 404);
});
