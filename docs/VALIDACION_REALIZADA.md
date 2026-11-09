# Estado de verificación al generar este paquete

**Comprobaciones efectuadas:** validación de JSON, sintaxis de JavaScript del backend con Node.js, sintaxis JSX del frontend con el parser de TypeScript, validación de scripts Bash y estructura del archivo Docker Compose con PyYAML. Se ejecutaron 3 pruebas unitarias de importes y todas aprobaron.

**Comprobaciones pendientes:** no fue posible instalar dependencias de npm porque el entorno de creación no resolvió `registry.npmjs.org` (`EAI_AGAIN`). Por tanto, aquí no se pudo confirmar un build Vite ni una ejecución completa con Express/Mongoose/MongoDB. Tampoco se dispuso de Docker o mongod para probar integración.

Una vez abierto GitHub Codespaces con conexión de red y Docker habilitado, ejecutar `npm run dev`, `npm test`, `npm run test:db --prefix server` y `npm run build`. No afirmar que estas pruebas han aprobado antes de ejecutarlas.

El proyecto se entrega como **código fuente preparado para prueba y demostración**, no como producto bancario listo para producción.
