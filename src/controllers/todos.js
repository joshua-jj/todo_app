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

//^ Function to get all todos
const getAllTodos = async (req, res) => {
  const { userID, firstName } = req.user;
  let queryAllTodos = `SELECT title, description, created_at, updated_at FROM todos WHERE user_id = ${userID}`;
  const [todos] = await db.query(queryAllTodos);
  if (todos.length == 0) throw new BadRequestError('No todos yet.');
  res.status(StatusCodes.OK).json({ mssg: `Welcome, ${firstName}`, todos });
};

//& Function to create todo
const createTodo = async (req, res) => {
  const { userID } = req.user;
  const { todoID } = req.params;
  const { title, description, tag } = req.body;
  if (!title) throw new BadRequestError('Please provide todo title');
  let queryTagID = `SELECT tag_id FROM tags WHERE name = '${tag}'`;
  const [[result]] = await db.query(queryTagID);
  const { tag_id: tagID } = result;
  // console.log(tagID);
  let queryInsertTodoTag = `INSERT INTO todos_tags (todo_id, tag_id) VALUES(${todoID}, ${tagID})`
  let queryInsertTodo = `INSERT INTO todos (title, description, user_id) VALUES ('${title}', '${description}', ${userID})`;
  await db.query(queryInsertTodo);
  res.status(StatusCodes.CREATED).json({ mssg: 'Todo created' });
};

//? Function to get a todo
const getTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  // let queryTodo = `SELECT title, description, created_at, updated_at FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this user
  const todo = await verifyTodo(todoID, userID);
  res.status(StatusCodes.OK).json({ todo });
};

//! Function to update todo
const updateTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  const { title, description } = req.body;

  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  let queryUpdate = `UPDATE todos SET title = '${title}', description = '${description}' WHERE todo_id = ${todoID}`;

  // // * Verify that todo belongs to this user
  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  await db.query(queryUpdate);
  res.status(StatusCodes.OK).json({ mssg: 'Todo updated' });
};

//~ Function to delete todo
const deleteTodo = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  let queryDelete = `DELETE FROM todos WHERE todo_id = ${todoID}`;
  let queryReset = `ALTER TABLE todos AUTO_INCREMENT = 1`;

  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this use
  await verifyTodo(todoID, userID);
  await db.query(queryDelete);

  // ^ Reset table to auto increment 1
  await db.query(queryReset);
  res.status(StatusCodes.OK).json({ mssg: 'Todo deleted' });
};

module.exports = { getAllTodos, createTodo, getTodo, updateTodo, deleteTodo };
