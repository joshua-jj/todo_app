const express = require('express');
const app = express();
const tasks = require('./routes/tasks');

const port = 5000;

// routes
app.get('/', (req, res) => {
  res.send('Todo App');
});

app.use('/api/v1/tasks', tasks);

app.listen(port, console.log(`Listening to port ${port}...`));
