# Guion breve de exposición — Ingeniería Web

**Inicio (20 s).** “Nuestro proyecto es BancaNova, un sistema de gestión de cuentas bancarias simplificado creado como ejercicio académico Full-Stack. Utilizamos React, Vite y Tailwind para la interfaz, Node.js y Express para la API REST, y MongoDB para guardar saldos y movimientos”.

**Arquitectura (35 s).** “Tenemos dos módulos: `/client` y `/server`. La interfaz está dividida en componentes que reciben props. El backend usa rutas, controladores, servicios y modelos. MongoDB almacena cuentas y movimientos; los importes se gestionan en centavos enteros para evitar errores de precisión”.

**Demostración (90 s).** “Con esta cuenta, consultamos el saldo inicial. Ahora deposito S/ 100 y el saldo y el historial se actualizan sin recargar la página. Retiro S/ 25 y hago un intento inválido que se rechaza por saldo insuficiente. Finalmente transfiero S/ 50 a una segunda cuenta. Compruebo en ambas cuentas el débito, el crédito y el historial”.

**Tecnología y seguridad (35 s).** “Las transferencias usan una transacción ACID de MongoDB: o se aplican el débito, el crédito y el registro, o se revierten todos. Por eso configuramos MongoDB como replica set. También manejamos respuestas HTTP 400, 404 y 500”.

**Cierre (20 s).** “Incluimos un README para instalar y ejecutar el proyecto, un script de seed que genera datos de prueba, y pruebas unitarias y de integración. Es una simulación académica y no procesa dinero real”.

## Preguntas frecuentes

**¿Por qué MongoDB en modo replica set?** Porque MongoDB necesita replica set o clúster fragmentado para transacciones ACID multidocumento. Un standalone no basta.

**¿Para qué sirve useState?** Para guardar valores reactivos como montos, cuenta seleccionada, alertas y operaciones pendientes.

**¿Para qué sirve useEffect?** Para cargar los datos de la cuenta cuando se abre la aplicación o cuando se cambia de cuenta, sin recargar la página.

**¿Qué hace el seed?** Inserta cuatro cuentas ficticias sin sobrescribir saldos existentes si se ejecuta otra vez.

**¿Qué pasa si alguien retira más de su saldo?** La API devuelve HTTP 400 y el saldo se mantiene intacto.

**¿Cómo evitan que una transferencia descuente sin acreditar?** El servicio agrupa débito, crédito y movimiento en una misma transacción MongoDB.

**¿Es seguro para banca real?** No. Es una práctica universitaria; un sistema productivo requiere autenticación, autorización, controles de seguridad, auditoría y supervisión regulatoria.
