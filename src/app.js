require('dotenv').config(); 
require('express-async-errors');

const express = require('express');
const authRouter = require('./routes/authRoute');
const todosRouter = require('./routes/todosRoute');
const tasksRouter = require('./routes/tasksRoute');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');
const app = express();

const port = process.env.PORT || 5000;

//~ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', authRouter);
app.use('/api/v1/todos', todosRouter);
app.use('/api/v1/todos', tasksRouter);
app.use('/api/v1/search', tasksRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
