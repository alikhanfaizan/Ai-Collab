
import express, { urlencoded } from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import connectDB from './db/db.js';
connectDB();
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/users', userRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!!!!!!!!!!!!');
}
);
export default app;
