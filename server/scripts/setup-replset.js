import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..');
const dataDir = path.join(serverDir, '.mongo-data');
const logPath = path.join(dataDir, 'mongod.log');
const pidPath = path.join(dataDir, 'mongod.pid');
const port = env.mongoReplsetPort;
const replSetName = env.mongoReplsetName;
const host = `127.0.0.1:${port}`;

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function encontrarMongod() {
  if (process.env.MONGOD_PATH && fs.existsSync(process.env.MONGOD_PATH)) {
    return process.env.MONGOD_PATH;
  }

  const base = 'C:\\Program Files\\MongoDB\\Server';
  if (fs.existsSync(base)) {
    const versiones = fs
      .readdirSync(base)
      .filter((nombre) => fs.existsSync(path.join(base, nombre, 'bin', 'mongod.exe')))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    if (versiones.length > 0) {
      return path.join(base, versiones[0], 'bin', 'mongod.exe');
    }
  }

  try {
    const salida = execFileSync('where.exe', ['mongod'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const ruta = salida.split(/\r?\n/).find(Boolean);
    if (ruta) return ruta.trim();
  } catch {
    // mongod no está en PATH
  }

  return null;
}

function puertoAbierto(puerto, hostname = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port: puerto, host: hostname });
    socket.setTimeout(1200);

    const terminar = (resultado) => {
      socket.destroy();
      resolve(resultado);
    };

    socket.once('connect', () => terminar(true));
    socket.once('timeout', () => terminar(false));
    socket.once('error', () => terminar(false));
  });
}

async function esperarPuerto(puerto, intentos = 80) {
  for (let i = 0; i < intentos; i += 1) {
    if (await puertoAbierto(puerto)) return true;
    await dormir(500);
  }
  return false;
}

async function iniciarMongod() {
  const mongod = encontrarMongod();

  if (!mongod) {
    throw new Error(
      'No se encontró mongod.exe. Instala MongoDB o define MONGOD_PATH en server/.env.'
    );
  }

  fs.mkdirSync(dataDir, { recursive: true });

  console.log(`Iniciando MongoDB con replica set en ${host}...`);
  console.log(`Binario: ${mongod}`);
  console.log(`Datos: ${dataDir}`);

  const hijo = spawn(
    mongod,
    [
      '--replSet',
      replSetName,
      '--port',
      String(port),
      '--bind_ip',
      '127.0.0.1',
      '--dbpath',
      dataDir,
      '--logpath',
      logPath,
      '--logappend',
    ],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }
  );

  hijo.unref();

  if (hijo.pid) {
    fs.writeFileSync(pidPath, String(hijo.pid));
  }

  const disponible = await esperarPuerto(port);
  if (!disponible) {
    throw new Error(
      `MongoDB no abrió el puerto ${port}. Revisa el log: ${logPath}`
    );
  }
}

async function asegurarReplicaSet() {
  await mongoose.connect(`mongodb://${host}/admin?directConnection=true`, {
    serverSelectionTimeoutMS: 15000,
  });

  const admin = mongoose.connection.db.admin();
  let hello = await admin.command({ hello: 1 });

  if (!hello.setName) {
    console.log('La instancia no tiene replica set. Inicializando...');
    try {
      await admin.command({
        replSetInitiate: {
          _id: replSetName,
          members: [{ _id: 0, host }],
        },
      });
    } catch (error) {
      if (error.code !== 23) {
        throw error;
      }
    }
  } else if (hello.setName !== replSetName) {
    throw new Error(
      `El puerto ${port} pertenece al replica set "${hello.setName}", ` +
        `pero se esperaba "${replSetName}".`
    );
  }

  for (let i = 0; i < 60; i += 1) {
    try {
      hello = await admin.command({ hello: 1 });
      if (hello.isWritablePrimary) {
        console.log(`Replica set "${hello.setName}" listo en ${host}.`);
        return;
      }
    } catch {
      // La conexión puede reiniciarse mientras se elige el primario.
    }
    await dormir(500);
  }

  throw new Error('El replica set no eligió un nodo primario a tiempo.');
}

async function principal() {
  const yaEscuchaba = await puertoAbierto(port);

  if (!yaEscuchaba) {
    await iniciarMongod();
  } else {
    console.log(`El puerto ${port} ya está en uso; verificando su configuración...`);
  }

  await asegurarReplicaSet();
  await mongoose.disconnect();

  console.log('\nSiguiente paso:');
  console.log('  npm run seed');
  console.log('\nMongoDB seguirá ejecutándose en segundo plano.');
  console.log(`Para detenerlo puedes usar el PID guardado en: ${pidPath}`);
}

principal().catch(async (error) => {
  console.error('\nNo se pudo preparar el replica set:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // sin conexión activa
  }
  process.exitCode = 1;
});
