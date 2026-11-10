import cors from 'cors';
import express from 'express';
import cuentaRoutes from './routes/cuenta.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cuenta', cuentaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
