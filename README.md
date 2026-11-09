# BancaNova — Sistema de Gestión de Cuenta Bancaria Simplificada

Proyecto académico **Full-Stack** para la asignatura Ingeniería Web. Implementa consulta de saldo, depósitos, retiros, transferencias atómicas e historial. **No es una aplicación bancaria real**; no incluye autenticación y utiliza datos ficticios para demostración.

## 1. Tecnologías y arquitectura

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite 6, Tailwind CSS 4, JSX, `useState` y `useEffect` |
| Backend | Node.js 22, Express, API REST, Mongoose |
| Datos | MongoDB 8 en un replica set local de un miembro (`rs0`) |
| Desarrollo sin instalación | GitHub Codespaces y Docker Compose |

La transferencia descuenta y acredita saldos, y registra un movimiento en **una transacción MongoDB ACID**. Los depósitos y retiros también actualizan saldo y movimiento en la misma transacción. Se guardan montos en **centavos enteros** para evitar errores de coma flotante. Se valida formato de cuenta, saldo suficiente, existencia del destino, montos mayores que cero, etc.

```text
.
├── .devcontainer/                 # Codespaces: editor en navegador
├── client/                        # React, Vite, Tailwind CSS
│   └── src/
│       ├── components/            # Sidebar, SaldoCard, FormOperacion, Historial
│       ├── lib/api.js             # Cliente HTTP
│       └── App.jsx                # Estado y sincronización
├── server/                        # API Express y persistencia MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── seed.js
│   └── test/                       # Pruebas unitarias e integración
├── docker-compose.yml             # MongoDB y entorno Node
├── scripts/init-replica.sh
├── docs/                           # API y guía de presentación
└── package.json                   # Scripts conjuntos
```

## 2. Inicio rápido — GitHub Codespaces (sin VS Code instalado)

Requiere cuenta GitHub con acceso a Codespaces y disponibilidad de cuota. Los contenedores se ejecutan remotamente: la base de datos es **local al entorno Docker de Codespaces**, no al ordenador de la universidad.

1. Sube todos los archivos del proyecto a la **raíz** del repositorio de GitHub (no solo el ZIP). Confirma que se ven `client/`, `server/`, `.devcontainer/` y `docker-compose.yml`.
2. En GitHub, pulsa **Code → Codespaces → Create codespace on main**. El navegador abre un editor parecido a VS Code, sin instalarlo.
3. La configuración `.devcontainer` iniciará MongoDB, configurará el replica set, instalará dependencias y creará las cuatro cuentas ficticias mediante `seed`. Espera a que termine **postCreateCommand**.
4. En la terminal de Codespaces, escribe:

   ```bash
   npm run dev
   ```

5. En la pestaña **Ports**, abre el puerto **5173** (React). El **3001** corresponde a la API REST. La primera visita puede pedir autorización para abrir el puerto.
6. Selecciona la cuenta `CTA-1001`, haz un depósito, un retiro y una transferencia a `CTA-1002`. Cambia la cuenta activa para verificar que se abonó el saldo de destino y aparece el historial.

**Si falló la instalación automática** ejecuta:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run seed
npm run dev
```

> La configuración del contenedor funciona con GitHub Codespaces cuando ofrece contenedores Docker Compose. Si tu cuenta u organización restringe Codespaces, usa Docker Desktop en una computadora que lo permita.

## 3. Inicio con Docker en PC propia

Requisitos: Docker Desktop / Docker Engine con Compose, conexión a internet para descargar imágenes y dependencias.

```bash
docker compose up -d
docker compose exec app bash -lc 'npm install && npm install --prefix server && npm install --prefix client'
docker compose exec app npm run seed
```

Abre **dos terminales**:

```bash
# Terminal 1
docker compose exec app npm run dev --prefix server
# Terminal 2
docker compose exec app npm run dev --prefix client
```

Sitio web: http://localhost:5173 · API: http://localhost:3001/api/health

Para detener los servicios: `docker compose down`. **No** uses `docker compose down -v` salvo que quieras borrar la base de datos de demostración.

## 4. MongoDB local sin Docker

Es requisito contar con Node.js 22+, MongoDB Server 7/8 y un **replica set** (un MongoDB independiente/standalone no admite transacciones multi-documento). En una máquina local con MongoDB previamente instalado, configura un único nodo `rs0` y ejecútalo. Luego establece `MONGODB_URI` en `server/.env` y ejecuta:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run seed
npm run dev
```

`server/.env.example` ofrece un ejemplo para Docker/Codespaces. Si MongoDB está ejecutándose directamente en tu equipo, sustituye el host `mongo` por `127.0.0.1` y habilita antes el replica set `rs0`. No publiques archivos `.env` con datos confidenciales.

## 5. Cuentas de prueba (seed idempotente)

| Cuenta | Titular ficticio | Saldo inicial |
| --- | --- | ---: |
| CTA-1001 | Alex Rivera | S/ 12,507.50 |
| CTA-1002 | María Flores | S/ 8,750.00 |
| CTA-1003 | Diego Torres | S/ 3,420.25 |
| CTA-1004 | Ana Rojas | S/ 5,100.50 |

`npm run seed` crea las cuentas faltantes sin modificar los saldos de las ya existentes. Se pueden reiniciar los datos de prueba con una base de datos nueva. **Los saldos y titulares son datos inventados, exclusivamente académicos.**

## 6. API REST

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api/cuentas` | Listar cuentas para elegir origen/destino |
| GET | `/api/cuenta/:id` | Saldo y detalle |
| POST | `/api/cuenta/deposito` | Sumar saldo |
| POST | `/api/cuenta/retiro` | Descontar saldo, sin permitir negativos |
| POST | `/api/cuenta/transferencia` | Transferir atómicamente entre cuentas |
| GET | `/api/cuenta/:id/historial` | Últimos 50 movimientos ordenados |
| GET | `/api/health` | Disponibilidad del servidor |

Los importes se envían en **soles** como texto con hasta dos decimales (`"150.50"`). La respuesta devuelve el importe convertido a string decimal. Se responde con HTTP `400` ante monto inválido o saldo insuficiente, `404` para cuentas no encontradas y `500` ante fallos internos. La creación de movimientos devuelve `201` y las consultas `200`.

### Ejemplos de solicitudes

```bash
curl http://localhost:3001/api/cuenta/CTA-1001
curl -X POST http://localhost:3001/api/cuenta/deposito -H 'Content-Type: application/json' -d '{"cuentaId":"CTA-1001","monto":"120.50"}'
curl -X POST http://localhost:3001/api/cuenta/retiro -H 'Content-Type: application/json' -d '{"cuentaId":"CTA-1001","monto":"15.00"}'
curl -X POST http://localhost:3001/api/cuenta/transferencia -H 'Content-Type: application/json' -d '{"cuentaOrigen":"CTA-1001","cuentaDestino":"CTA-1002","monto":"50.00"}'
curl http://localhost:3001/api/cuenta/CTA-1001/historial
```

Documentación más completa: [`docs/API.md`](docs/API.md).

## 7. Pruebas

```bash
npm test                        # Pruebas unitarias sin MongoDB
npm run test:db --prefix server  # Requiere MongoDB local de prueba (replica set)
npm run build                   # Genera el frontend de producción
```

La prueba de integración utiliza y borra **exclusivamente una base cuyo nombre termina en `_test`** (por defecto `cuenta_bancaria_test`), y verifica depósito, retiro, saldo insuficiente, transferencia, inexistencia del destino e historial. No apuntar al nombre de una base de datos productiva.

## 8. Checklist de evaluación

| Criterio | Implementación / evidencia |
| --- | --- |
| Backend + API REST | Cinco endpoints obligatorios, servicio de transacciones, códigos HTTP |
| Arquitectura React + Vite | Componentes por responsabilidad y props reutilizables |
| useState + useEffect | Estado del formulario, carga, errores, actualización automática |
| Tailwind responsive | Diseño adaptativo con utilidades Tailwind, alertas y estados |
| Documentación y entregables | Repo `/client`, `/server`, README, seed, Codespaces, pruebas |

La nota depende de la **demostración real** y de la evaluación del docente; la presencia del código no garantiza la puntuación máxima.

## 9. Seguridad y alcance

**SOLO DEMOSTRACIÓN ACADÉMICA.** No contiene autenticación, autorización, auditoría antifraude, límites transaccionales reales ni controles regulatorios. No usar con clientes ni fondos verdaderos. Los números y datos son ficticios. No desplegar esta API en internet públicamente sin controles de seguridad.

## 10. Entrega del profesor

1. Subir y confirmar el proyecto en un repositorio público de GitHub.
2. Demostrar las operaciones con MongoDB funcionando.
3. Registrar la URL pública en el formulario oficial de la consigna: https://forms.gle/XSWgDYb3tviYnirh7
