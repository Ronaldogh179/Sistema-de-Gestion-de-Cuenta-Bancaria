import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27018/cuenta_bancaria?replicaSet=rs0',
  mongoReplsetPort: Number(process.env.MONGO_REPLSET_PORT) || 27018,
  mongoReplsetName: process.env.MONGO_REPLSET_NAME || 'rs0',
};
