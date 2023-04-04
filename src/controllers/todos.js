const db = require('../db/connect');
require('express-async-errors');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// * Function to verify if todo belongs to the logged in user
const verifyTodo = async (todoID, userID) => {
  let queryTodo = `SELECT title, description, created_at, updated_at FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  const [todo] = await db.query(queryTodo);
  if (todo.length == 0) {
    throw new NotFoundError(`No todo with id ${todoID}`);
  }
  return todo;
};

//! Function to reset table to auto increment 1
const resetTable = async table => {
  let queryReset = `ALTER TABLE ${table} AUTO_INCREMENT = 1`;
  await db.query(queryReset);
};


//^ Function to get all todos
const getAllTodos = async (req, res) => {
  const { userID, firstName } = req.user;
  let queryAllTodos = `SELECT todos.*, tags.name AS tag FROM todos LEFT JOIN todos_tags ON todos.todo_id = todos_tags.todo_id LEFT JOIN tags ON  todos_tags.tag_id = tags.tag_id WHERE todos.user_id = ${userID}`;
  const [todos] = await db.query(queryAllTodos);
  if (todos.length == 0) throw new BadRequestError('No todos yet.');
  res.status(StatusCodes.OK).json({ mssg: `Welcome, ${firstName}`, todos });
};

//& Function to create todo
const createTodo = async (req, res) => {
  const { userID } = req.user;
  const { title, description, tag } = req.body;
  if (!title) throw new BadRequestError('Please provide todo title');
  let result, tagID;
  // let { tag_id: tagID } = result;
  let queryInsertTodo = `INSERT INTO todos (title, description, user_id) VALUES ('${title}', '${description}', ${userID})`;
  await db.query(queryInsertTodo);
  const [[lastID]] = await db.query(`SELECT LAST_INSERT_ID()`);

  //~ Get id of newly inserted todo;
  const { 'LAST_INSERT_ID()': todoID } = lastID;

  //& Reset todos_tags table to auto increment 1
  await resetTable('todos_tags');

  if (tag) {
    let queryTagID = `SELECT tag_id FROM tags WHERE name = '${tag}'`;
    [[result]] = await db.query(queryTagID);
    tagID = result.tag_id;
  } else {
    tagID = null;
  }
  
  let queryInsertTodoTag = `INSERT INTO todos_tags (todo_id, tag_id) VALUES(${todoID}, ${tagID})`;
  await db.query(queryInsertTodoTag);
  res.status(StatusCodes.CREATED).json({ mssg: 'Todo created' });
};

//? Function to get a todo
const getTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  let queryTodo = `SELECT todos.*, tags.name AS tag FROM todos LEFT JOIN todos_tags ON todos.todo_id = todos_tags.todo_id LEFT JOIN tags ON  todos_tags.tag_id = tags.tag_id WHERE todos.todo_id = ${todoID} AND todos.user_id = ${userID}`;
  const [todo] = await db.query(queryTodo);
  //* Verify that todo belongs to this user
  if (todo.length == 0) {
    throw new NotFoundError(`No todo with id ${todoID}`);
  }
  res.status(StatusCodes.OK).json({ todo });
};

//! Function to update todo
const updateTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  const { title, description, tag } = req.body;
  let result, tagID;
  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  let queryUpdateTodo = `UPDATE todos SET title = '${title}', description = '${description}' WHERE todo_id = ${todoID}`;

  // // * Verify that todo belongs to this user
  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  await db.query(queryUpdateTodo);

  //& Reset todos_tags table to auto increment 1
  await resetTable('todos_tags');

  if (tag) {
    let queryTagID = `SELECT tag_id FROM tags WHERE name = '${tag}'`;
    [[result]] = await db.query(queryTagID);
    tagID = result.tag_id;
  } else {
    tagID = null;
  }
  
  let queryUpdateTodoTag = `UPDATE todos_tags SET tag_id = ${tagID} WHERE todo_id = ${todoID}`;
  await db.query(queryUpdateTodoTag);
  res.status(StatusCodes.OK).json({ mssg: 'Todo updated' });
};

//~ Function to delete todo
const deleteTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  let queryDeleteTodo = `DELETE FROM todos WHERE todo_id = ${todoID}`;

  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this use
  await verifyTodo(todoID, userID);
  await db.query(queryDeleteTodo);

  // ^ Reset todos table to auto increment 1
  await resetTable('todos');
  res.status(StatusCodes.OK).json({ mssg: 'Todo deleted' });
};

module.exports = { getAllTodos, createTodo, getTodo, updateTodo, deleteTodo };
