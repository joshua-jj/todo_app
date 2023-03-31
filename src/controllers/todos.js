const getAllTodos = (req, res) => {
  const {id, name} = req.user
  res.send(name);
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
  res.send('Todo deleted');
};

module.exports = { getAllTodos, createTodo, getTodo, updateTodo, deleteTodo };
