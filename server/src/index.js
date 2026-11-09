import 'dotenv/config';
import { crearApp } from './app.js';
import { conectarBD } from './config/database.js';
const PORT = Number(process.env.PORT || 3001);
try {
  await conectarBD(process.env.MONGODB_URI || 'mongodb://mongo:27017/cuenta_bancaria?replicaSet=rs0&directConnection=true');
  crearApp().listen(PORT, '0.0.0.0', () => console.log(`API escuchando en http://localhost:${PORT}`));
} catch (error) {
  console.error('No se pudo iniciar la API:', error.message);
  process.exit(1);
}
