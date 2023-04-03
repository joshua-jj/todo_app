const db = require('../db/connect');
require('express-async-errors');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// * Function to verify that todo belongs to the logged in user
const verifyTodo = async (todoID, userID) => {
  let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  const [todo] = await db.query(queryTodo);
  if (todo.length == 0) {
    throw new NotFoundError(`No todo with id ${todoID}`);
  }
};

// ? Function to verify that task belongs to belongs to the todo_id
const verifyTask = async (taskID, todoID) => {
  let queryTask = `SELECT title, description, completed, deadline, created_at, updated_at FROM tasks where task_id = ${taskID} AND todo_id = ${todoID}`;
  const [task] = await db.query(queryTask);
  if (task.length == 0) {
    throw new NotFoundError(`No task with id ${taskID}`);
  }
  return task;
};

//^ Function to get all tasks
const getAllTasks = async (req, res) => {
  const { todoID } = req.params;
  let queryAllTasks = `SELECT title, description, completed, deadline, created_at, updated_at FROM tasks where todo_id = ${todoID}`;
  const [tasks] = await db.query(queryAllTasks);
  if (tasks.length == 0) throw new BadRequestError('No tasks yet.');
  res.status(StatusCodes.OK).json({ tasks });
};

//& Function to create todo
const createTask = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline } = req.body;
  const isCompleted = completed === 'on';

  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;
  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  if (!title) throw new BadRequestError('Please provide task title');
  let queryTasks = `SELECT * FROM tasks WHERE title = '${title}'`;
  let queryInsertTask;
  if (!deadline) {
    deadline = null;
    queryInsertTask = `INSERT INTO tasks (title, description, completed, deadline, todo_id) VALUES ('${title}', '${description}', ${isCompleted}, ${deadline}, ${todoID})`;
  } else {
    queryInsertTask = `INSERT INTO tasks (title, description, completed, deadline, todo_id) VALUES ('${title}', '${description}', ${isCompleted}, '${deadline}', ${todoID})`;
  }
  const [tasks] = await db.query(queryTasks);
  if (tasks.length > 0) throw new BadRequestError('Task already exists');
  await db.query(queryInsertTask);
  res.status(StatusCodes.CREATED).json({ mssg: 'Task created' });
};

//? Function to get a todo
const getTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;

  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }

  //& Verify that task exists
  const task = await verifyTask(taskID, todoID);
  // let queryTask = `SELECT title, description, completed, deadline, created_at, updated_at FROM tasks where task_id = ${taskID} AND todo_id = ${todoID}`;
  // const [task] = await db.query(queryTask);
  // if (task.length == 0) {
  //   throw new NotFoundError(`No todo with id ${taskID}`);
  // }
  res.status(StatusCodes.OK).json({ task });
};

//! Function to update todo
const updateTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline } = req.body;
  const isCompleted = completed === 'on';

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  // let queryTodo = `SELECT * FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;

  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }
  // let queryTask = `SELECT * FROM tasks WHERE task_id = ${taskID} AND todo_id = ${todoID}`;
  let queryUpdate;

  if (!deadline) {
    deadline = null;
    queryUpdate = `UPDATE tasks SET title = '${title}', description = '${description}', completed = ${isCompleted}, deadline = ${deadline} WHERE task_id = ${taskID}`;
  } else {
    queryUpdate = `UPDATE tasks SET title = '${title}', description = '${description}', completed = ${isCompleted}, deadline = '${deadline}' WHERE task_id = ${taskID}`;
  }

  //& Verify that task exists
  await verifyTask(taskID, todoID);
  // const [task] = await db.query(queryTask);
  // if (task.length == 0) {
  //   throw new NotFoundError(`No task with id ${taskID}`);
  // }
  await db.query(queryUpdate);
  res.status(StatusCodes.OK).json({ mssg: 'Task updated' });
};

//~ Function to delete todo
const deleteTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  // let queryTodo = `SELECT title, description, created_at, updated_at FROM todos where todo_id = ${todoID} AND user_id = ${userID}`;

  // const [todo] = await db.query(queryTodo);
  // if (todo.length == 0) {
  //   throw new NotFoundError(`No todo with id ${todoID}`);
  // }

  // let queryTask = `SELECT * FROM tasks WHERE task_id = ${taskID} AND todo_id = ${todoID}`;
  let queryDelete = `DELETE FROM tasks WHERE task_id = ${taskID}`;
  let queryReset = `ALTER TABLE tasks AUTO_INCREMENT = 1`;

  //& Verify that task exists
  await verifyTask(taskID, todoID);
  // const [task] = await db.query(queryTask);
  // if (task.length == 0) {
  //   throw new NotFoundError(`No task with id ${taskID}`);
  // }
  await db.query(queryDelete);

  // ^ Reset table to auto increment 1
  await db.query(queryReset);
  res.status(StatusCodes.OK).json({ mssg: 'Task deleted' });
};

module.exports = { getAllTasks, createTask, getTask, updateTask, deleteTask };
