# Contrato de API REST

Base: `http://localhost:3001/api`. Respuestas JSON, importes en soles como strings de dos decimales. Los números de cuenta tienen formato `CTA-1001`.

## GET /cuentas

`200`: `{ "cuentas": [{"id":"CTA-1001","numero":"CTA-1001","titular":"Alex Rivera","moneda":"PEN","saldo":"12507.50"}] }`

## GET /cuenta/:id

`200`: `{ "cuenta": {"id":"CTA-1001","numero":"CTA-1001","titular":"Alex Rivera","moneda":"PEN","saldo":"12507.50"} }`

`400`: formato inválido. `404`: cuenta inexistente.

## POST /cuenta/deposito

```json
{ "cuentaId": "CTA-1001", "monto": "50.00" }
```

`201`: `{ "mensaje": "Depósito realizado.", "cuenta": {...}, "movimiento": {...} }`. `400`: monto inválido. `404`: cuenta inexistente.

## POST /cuenta/retiro

```json
{ "cuentaId": "CTA-1001", "monto": "25.50" }
```

`201`: retiro válido. `400`: monto inválido o saldo insuficiente. `404`: cuenta inexistente. **Saldo nunca negativo**.

## POST /cuenta/transferencia

```json
{ "cuentaOrigen": "CTA-1001", "cuentaDestino": "CTA-1002", "monto": "10.00" }
```

`201`: transferencia confirmada. Incluye `cuenta` (origen), `cuentaDestino` y `movimiento`. `400`: mismo origen/destino, fondos insuficientes o monto inválido. `404`: alguna cuenta inexistente.

**Atomicidad:** las tres acciones (descontar origen, acreditar destino, crear movimiento) ocurren en una única transacción MongoDB con sesión, y se confirman juntas o se revierten juntas. Requiere replica set.

## GET /cuenta/:id/historial

`200`: `{ "movimientos": [{ "id":"...", "tipo":"TRANSFERENCIA", "monto":"10.00", "fecha":"2026-11-09T00:00:00.000Z", "cuentaOrigen":"CTA-1001", "cuentaDestino":"CTA-1002" }] }`

Busca operaciones donde la cuenta figura como origen **o** destino; 50 registros máximo, más recientes primero. `404`: cuenta inexistente.

## Errores

```json
{ "error": "Saldo insuficiente." }
```

- HTTP 400: dato mal formado, monto cero/negativo o insuficiencia.
- HTTP 404: cuenta o ruta no encontrada.
- HTTP 500: errores inesperados del servidor; no se revelan credenciales internas.
