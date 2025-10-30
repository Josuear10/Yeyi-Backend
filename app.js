import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import employeesRoutes from './routes/employeesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import paymentRoutes from './routes/paymentsRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import detailsRoutes from './routes/detailsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/employees', employeesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/details', detailsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
