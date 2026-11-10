# Sistema de Gestión de Cuenta Bancaria Simplificada

Aplicación web full-stack para consultar saldos, depositar, retirar, transferir y ver el historial de movimientos de cuentas bancarias ficticias.

- **Backend:** Node.js + Express + JavaScript + Mongoose + MongoDB local.
- **Frontend:** React + Vite + JSX + Tailwind CSS.
- **Sin** Docker, Atlas, TypeScript, Next.js ni autenticación.

## Estructura

```
server/                 API REST, modelos, seed y pruebas
  src/
    config/             Conexión a MongoDB y variables de entorno
    models/             Cuenta y Movimiento
    services/           Lógica de negocio con transacciones
    controllers/        Controladores HTTP
    routes/             Rutas /api/cuenta
    middlewares/        Manejo de errores
  scripts/              Configuración del replica set local
  tests/                Pruebas con node:test + supertest
  seed.js               Seed idempotente de 3 cuentas
client/                 Interfaz React + Vite + Tailwind
  src/components/       Componentes separados con props y estado
  src/api/              Cliente de la API con fetch
```

## Requisitos

- Node.js 20.19 o superior.
- MongoDB instalado localmente.
- npm.

## Instalación y ejecución

### 1. Backend

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run mongo:setup
npm run seed
npm run dev
```

La API queda en `http://localhost:5000`.

### 2. Frontend

En otra terminal:

```powershell
cd client
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Variables de entorno

Archivo `server/.env` (parte de `server/.env.example`):

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `5000` | Puerto de la API |
| `MONGODB_URI` | `mongodb://127.0.0.1:27018/cuenta_bancaria?replicaSet=rs0` | Conexión a MongoDB |
| `MONGO_REPLSET_PORT` | `27018` | Puerto del replica set local del proyecto |
| `MONGO_REPLSET_NAME` | `rs0` | Nombre del replica set |

El cliente usa el proxy de Vite `/api -> http://localhost:5000`. Opcionalmente se puede definir `VITE_API_URL` en `client/.env`.

## MongoDB y replica set

Las transacciones de MongoDB requieren un **replica set**, aunque tenga un solo nodo. La instalación detectada en este equipo tiene MongoDB 9.0 como servicio de Windows en `27017`, pero **sin replica set**. No se modificó ese servicio ni su archivo de configuración.

Para no alterar la instalación existente, el proyecto incluye una instancia independiente:

- Puerto: `27018`
- Nombre del replica set: `rs0`
- Datos: `server/.mongo-data/` (ignorado por git)

`npm run mongo:setup` realiza automáticamente:

1. Inicia `mongod` en segundo plano con `--replSet rs0 --port 27018`.
2. Inicializa el replica set con un nodo `127.0.0.1:27018`.
3. Espera a que el nodo sea primario.
4. Guarda el PID en `server/.mongo-data/mongod.pid`.

El script no toca servicios de Windows. Si prefieres usar el servicio existente de `27017`, los pasos manuales (requieren administrador) serían:

```powershell
Stop-Service -Name MongoDB
```

Editar `C:\Program Files\MongoDB\Server\9.0\bin\mongod.cfg` y agregar:

```yaml
replication:
  replSetName: rs0
```

Luego:

```powershell
Start-Service -Name MongoDB
mongosh --host 127.0.0.1:27017 --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
```

Finalmente cambiar `MONGODB_URI` en `server/.env` a:

```
MONGODB_URI=mongodb://127.0.0.1:27017/cuenta_bancaria?replicaSet=rs0
```

> Estos cambios sobre el servicio de Windows no fueron ejecutados por el proyecto.

## API REST

Base: `http://localhost:5000/api`

| Método | Ruta | Cuerpo / parámetros |
| --- | --- | --- |
| GET | `/cuenta/:id` | `id` de la cuenta |
| POST | `/cuenta/deposito` | `{ "cuentaId": "...", "montoCents": 10000 }` |
| POST | `/cuenta/retiro` | `{ "cuentaId": "...", "montoCents": 5000 }` |
| POST | `/cuenta/transferencia` | `{ "cuentaOrigenId": "...", "cuentaDestinoId": "...", "montoCents": 2500 }` |
| GET | `/cuenta/:id/historial` | `id` de la cuenta |

Los montos de la API se expresan **en céntimos enteros** (`10000` = `S/ 100.00`). El frontend convierte lo que escribe el usuario y formatea las respuestas.

Respuestas de error: `400` datos inválidos o saldo insuficiente, `404` cuenta no encontrada, `500` error interno.

## Seed

```powershell
cd server
npm run seed
```

Es idempotente: usa `_id` fijos y `$setOnInsert`, por lo que repetirlo no duplica cuentas ni sobrescribe saldos existentes.

| _id | Número | Titular | Saldo inicial |
| --- | --- | --- | --- |
| `650000000000000000000001` | `001-100001` | Ana Torres | `S/ 5,000.00` |
| `650000000000000000000002` | `001-100002` | Luis Ramírez | `S/ 2,750.50` |
| `650000000000000000000003` | `001-100003` | María Fernández | `S/ 1,200.00` |

## Pruebas

```powershell
cd server
npm test
```

El replica set debe estar activo (por ejemplo, tras ejecutar `npm run mongo:setup` una vez). Las pruebas usan la base `cuenta_bancaria_test`, validan códigos `400/404`, depósitos, retiros, transferencias, historial y que un retiro/transferencia sin saldo no altere los saldos.

## Notas

- Los saldos se guardan como enteros (`saldoCents`) para evitar errores de coma flotante.
- La transferencia actualiza ambos saldos y crea el movimiento dentro de `session.withTransaction`.
- No hay autenticación ni funcionalidades adicionales, según la consigna.
