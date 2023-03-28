const express = require('express');
const todos = require('./routes/todos');
const app = express();

const port = 5000;


// middleware
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('Todo App');
});

app.use('/api/v1/todos', todos);

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
