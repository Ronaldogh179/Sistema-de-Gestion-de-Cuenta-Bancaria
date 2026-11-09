import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMonto, centavosASoles } from '../src/utils/money.js';

test('convierte cantidades en centavos con precisión', () => {
  assert.equal(parseMonto('0.01'), 1);
  assert.equal(parseMonto('100.10'), 10010);
  assert.equal(parseMonto(42.5), 4250);
  assert.equal(centavosASoles(10010), '100.10');
});
test('rechaza cero, negativos y más de dos decimales', () => {
  for (const valor of [0, '-1', '0.00', '0.001', '10.999', '', null, {}, 'NaN', '1e3']) {
    assert.throws(() => parseMonto(valor), { status: 400 });
  }
});
test('rechaza números fuera del límite admitido', () => {
  assert.throws(() => parseMonto('1000000000'), { status: 400 });
});
