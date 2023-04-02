require('dotenv').config(); 

const express = require('express');
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const app = express();

const port = process.env.PORT || 5000;

//~ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', authRouter);
app.use('/api/v1/todos', todosRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
