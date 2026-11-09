# Roadmap y correspondencia con rúbrica

| Fase | Hito verificable | Archivos principales | Estado de código |
| --- | --- | --- | --- |
| 1. Arquitectura | `/server` y `/client`; modelos de cuenta y movimiento | `server/src/models/*`, `docker-compose.yml` | Preparado |
| 2. Backend | Saldo, depósito, retiro, transferencia, historial, códigos HTTP | `server/src/routes/*`, `server/src/services/*` | Preparado |
| 3. Frontend | Dashboard, formularios, cuentas, actualizaciones reactivas | `client/src/App.jsx`, `client/src/components/*` | Preparado |
| 4. Integración | Pruebas de datos inválidos, saldo, destino, transferencia | `server/test/*` | Pruebas incluidas; ejecutar con MongoDB |
| 5. Entrega | README, seed, GitHub, Codespaces y demostración | `README.md`, `server/src/seed.js`, `.devcontainer` | Pendiente subir y demostrar |

## Orden de verificación ante el docente

1. Confirmar que el repositorio contiene la estructura original (no un ZIP aislado).
2. Mostrar el log de API conectada a MongoDB y las cuentas creadas con `npm run seed`.
3. Abrir la web de React y elegir una cuenta.
4. Depositar S/ 100.00; comparar saldo antes/después; ver movimiento.
5. Retirar S/ 25.00; intentar retirar una suma superior al saldo y mostrar error.
6. Transferir S/ 50.00 a otra cuenta; verificar que el origen pierde S/ 50.00 y el destino gana S/ 50.00; abrir historiales de ambas.
7. Enseñar estructura React/Vite/Tailwind, `useState`/`useEffect`, el servicio transaccional y el README.
8. Ejecutar `npm test`, `npm run test:db --prefix server` y `npm run build`.

**Importante:** no declarar el proyecto probado ni la máxima calificación hasta ejecutar estas comprobaciones en un entorno real con dependencias y MongoDB.
