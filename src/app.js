import express from 'express';
import friendRoutes from './routes/friend.routes.js';
import usersRouter from './routes/users';

const app = express();

app.use('/api/friends', friendRoutes);

app.use('/api/users', usersRouter);





