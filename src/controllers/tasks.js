const getAllTodos = (req, res) => {
  res.send('Get all todos');
};

const createTodo = (req, res) => {
  res.send('Todo created');
};

const getTodo = (req, res) => {
  res.send('Get single todo');
};

const updateTodo = (req, res) => {
  res.send('Todo updated');
};

const deleteTodo = (req, res) => {
  res.send('Todo created');
};

module.exports = { getAllTodos, createTodo, getTodo, updateTodo, deleteTodo };
