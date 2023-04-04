const db = require('../db/connect');
require('express-async-errors');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// * Function to verify that todo belongs to the logged in user
const verifyTodo = async (todoID, userID) => {
  let queryTodo = `SELECT * FROM todos where id = ${todoID} AND user_id = ${userID}`;
  const [todo] = await db.query(queryTodo);
  if (todo.length == 0) {
    throw new NotFoundError(`No todo with id ${todoID}`);
  }
};

// ? Function to verify that task belongs to belongs to the todo_id
const verifyTask = async (taskID, todoID) => {
  let queryTask = `SELECT * FROM tasks where id = ${taskID} AND todo_id = ${todoID}`;
  const [task] = await db.query(queryTask);
  if (task.length == 0) {
    throw new NotFoundError(`No task with id ${taskID}`);
  }
};

//! Function to reset table to auto increment 1
const resetTable = async table => {
  let queryReset = `ALTER TABLE ${table} AUTO_INCREMENT = 1`;
  await db.query(queryReset);
};

//^ Function to get all tasks
const getAllTasks = async (req, res) => {
  const { todoID } = req.params;
  let queryAllTasks = `SELECT tasks.*, priorities.name AS priority FROM tasks LEFT JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id LEFT JOIN priorities ON  tasks_priorities.priority_id = priorities.id WHERE tasks.todo_id = ${todoID}`;
  const [tasks] = await db.query(queryAllTasks);
  if (tasks.length == 0) throw new BadRequestError('No tasks yet.');
  res.status(StatusCodes.OK).json({ tasks });
};

//& Function to create todo
const createTask = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline, priority } = req.body;
  let result, priorityID;
  const isCompleted = completed === 'on';

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  if (!title) throw new BadRequestError('Please provide task title');
  let queryTasks = `SELECT * FROM tasks WHERE title = "${title}"`;
  let queryInsertTask;
  if (!deadline) {
    deadline = null;
    queryInsertTask = `INSERT INTO tasks (title, description, completed, deadline, todo_id) VALUES ("${title}", "${description}", ${isCompleted}, ${deadline}, ${todoID})`;
  } else {
    queryInsertTask = `INSERT INTO tasks (title, description, completed, deadline, todo_id) VALUES ("${title}", "${description}", ${isCompleted}, "${deadline}", ${todoID})`;
  }
  const [tasks] = await db.query(queryTasks);
  if (tasks.length > 0) throw new BadRequestError('Task already exists');
  await db.query(queryInsertTask);
  const [[lastID]] = await db.query(`SELECT LAST_INSERT_ID()`);

  //~ Get id of newly inserted task;
  const { 'LAST_INSERT_ID()': taskID } = lastID;

  //& Reset tasks_priorities table to auto increment 1
  await resetTable('tasks_priorities');

  if (priority) {
    let queryPriorityID = `SELECT id FROM priorities WHERE name = '${priority}'`;
    [[result]] = await db.query(queryPriorityID);
    priorityID = result.id;
  } else {
    priorityID = null;
  }
  let queryInsertTaskPriority = `INSERT INTO tasks_priorities (task_id, priority_id) VALUES(${taskID}, ${priorityID})`;
  await db.query(queryInsertTaskPriority);

  res.status(StatusCodes.CREATED).json({ mssg: 'Task created' });
};

//? Function to get a todo
const getTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  //& Verify that task exists and belongs to the todo_id
  let queryTask = `SELECT tasks.*, priorities.name AS priority FROM tasks LEFT JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id LEFT JOIN priorities ON  tasks_priorities.priority_id = priorities.id WHERE tasks.id = ${taskID} AND tasks.todo_id = ${todoID}`;
  const [task] = await db.query(queryTask);
  if (task.length == 0) {
    throw new NotFoundError(`No task with id ${taskID}`);
  }
  res.status(StatusCodes.OK).json({ task });
};

//! Function to update task
const updateTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline, priority } = req.body;
  let result, priorityID;
  const isCompleted = completed === 'on';

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  let queryUpdateTask;

  if (!deadline) {
    deadline = null;
    queryUpdateTask = `UPDATE tasks SET title = "${title}", description = "${description}", completed = ${isCompleted}, deadline = ${deadline} WHERE id = ${taskID}`;
  } else {
    queryUpdateTask = `UPDATE tasks SET title = "${title}", description = "${description}", completed = ${isCompleted}, deadline = "${deadline}" WHERE id = ${taskID}`;
  }

  //& Verify that task exists
  await verifyTask(taskID, todoID);
  await db.query(queryUpdateTask);

  //& Reset tasks_priorities table to auto increment 1
  await resetTable('tasks_priorities');

  if (priority) {
    let queryPriorityID = `SELECT id FROM priorities WHERE name = '${priority}'`;
    [[result]] = await db.query(queryPriorityID);
    priorityID = result.id;
  } else {
    priorityID = null;
  }

  let queryUpdateTaskPriority = `UPDATE tasks_priorities SET priority_id = ${priorityID} WHERE task_id = ${taskID}`;
  await db.query(queryUpdateTaskPriority);
  res.status(StatusCodes.OK).json({ mssg: 'Task updated' });
};

//~ Function to delete todo
const deleteTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  let queryDeleteTask = `DELETE FROM tasks WHERE id = ${taskID}`;

  //& Verify that task exists or belongs to the todo_id
  await verifyTask(taskID, todoID);
  await db.query(queryDeleteTask);

  // ^ Reset tasks table to auto increment 1
  await resetTable('tasks');
  res.status(StatusCodes.OK).json({ mssg: 'Task deleted' });
};

const searchTask = async (req, res) => {
  const { userID } = req.user;
  const { query } = req.query;
  // console.log(typeof(query));
  let querySearch = `
    SELECT tasks.id, tasks.title AS task_title, todos.title AS todo_title, priorities.name AS priority FROM tasks 
    JOIN todos ON tasks.todo_id = todos.id
    JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id 
    LEFT JOIN priorities ON tasks_priorities.priority_id = priorities.id
    WHERE todo_id IN (SELECT id FROM todos WHERE user_id = ${userID}) AND tasks.title LIKE "%${query}%"
    `;
  const [result] = await db.query(querySearch);
  console.log(result.length);
  if (result.length == 0) throw new NotFoundError('No result found');
  res.status(StatusCodes.OK).json({ result });
};

module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  searchTask,
};
