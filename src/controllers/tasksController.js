const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { verifyTodo, verifyTask } = require('./helperController');

// Function to insert files into task table
const insertFiles = async (file, taskID) => {
  let queryInsertFile;
  if (file.length > 0) {
    for (const item of file) {
      queryInsertFile = `INSERT INTO files (file, task_id) VALUES("${item}", ${taskID})`;
      await db.query(queryInsertFile);
    }
  } else {
    queryInsertFile = `INSERT INTO files (task_id) VALUES(${taskID})`;
    await db.query(queryInsertFile);
  }
};

// Function to get all tasks
const getAllTasks = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  let { sortBy, sortOrder } = req.query;
  sortOrder = sortOrder || 'asc';

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  const queryAll = `SELECT tasks.*, priorities.name AS priority, files.file FROM tasks LEFT JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id LEFT JOIN priorities ON tasks_priorities.priority_id = priorities.id LEFT JOIN files ON tasks.id = files.task_id WHERE tasks.todo_id = ${todoID}`;

  let queryAllTasks = queryAll;

  // Query to sort tasks by title
  if (sortBy && sortBy == 'title') {
    queryAllTasks = `${queryAll} ORDER BY tasks.title ${sortOrder}`;
  }

  // Query to sort tasks by the date they were last updated
  if (sortBy && sortBy == 'last updated') {
    queryAllTasks = `${queryAll} ORDER BY tasks.updated_at ${sortOrder}`;
  }

  if (sortBy && sortBy !== 'title' && sortBy !== 'last updated') {
    throw new BadRequestError('Invalid sort criteria');
  }

  if (sortOrder && sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new BadRequestError('Invalid sort criteria');
  }

  const [tasks] = await db.query(queryAllTasks);
  if (tasks.length == 0) throw new BadRequestError('No tasks yet.');
  res.status(StatusCodes.OK).json({ tasks });
};

// Function to create todo
const createTask = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline, priority, file } = req.body;
  let result, priorityID;
  const isCompleted = completed === 'on';

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  if (!title) throw new BadRequestError('Please provide task title');
  let queryTasks = `SELECT * FROM tasks WHERE title = "${title}"`;
  let queryInsertTask;
  if (deadline) {
    queryInsertTask = `INSERT INTO tasks (title, description, completed, deadline, todo_id) VALUES ("${title}", "${description}", ${isCompleted}, "${deadline}", ${todoID})`;
  } else {
    queryInsertTask = `INSERT INTO tasks (title, description, completed, todo_id) VALUES ("${title}", "${description}", ${isCompleted}, ${todoID})`;
  }
  const [tasks] = await db.query(queryTasks);
  if (tasks.length > 0) throw new BadRequestError('Task already exists');

  // Insert into task table
  await db.query(queryInsertTask);
  const [[lastID]] = await db.query(`SELECT LAST_INSERT_ID()`);
  const [last] = await db.query(`SELECT LAST_INSERT_ID()`);

  // Get id of newly inserted task;
  const { 'LAST_INSERT_ID()': taskID } = lastID;

  if (priority) {
    let queryPriorityID = `SELECT id FROM priorities WHERE name = '${priority}'`;
    [[result]] = await db.query(queryPriorityID);
    priorityID = result.id;
  } else {
    priorityID = null;
  }
  let queryInsertTaskPriority = `INSERT INTO tasks_priorities (task_id, priority_id) VALUES(${taskID}, ${priorityID})`;

  // Insert into task_priority table
  await db.query(queryInsertTaskPriority);

  // Insert into files table
  await insertFiles(file, taskID);
  res.status(StatusCodes.CREATED).json({ mssg: 'Task created' });
};

// Function to get a todo
const getTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  // Verify that task exists in the todo before display
  let queryTask = `SELECT tasks.*, priorities.name AS priority, files.file FROM tasks LEFT JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id LEFT JOIN priorities ON tasks_priorities.priority_id = priorities.id LEFT JOIN files ON tasks.id = files.task_id WHERE tasks.id = ${taskID} AND tasks.todo_id = ${todoID}`;
  const [task] = await db.query(queryTask);
  if (task.length == 0) {
    throw new NotFoundError('Task does not exist');
  }
  res.status(StatusCodes.OK).json({ task });
};

// Function to update task
const updateTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;
  let { title, description, completed, deadline, priority, file } = req.body;
  let result, priorityID;
  const isCompleted = completed === 'on';

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  let queryUpdateTask;

  if (deadline) {
    queryUpdateTask = `UPDATE tasks SET title = "${title}", description = "${description}", completed = ${isCompleted}, deadline = "${deadline}" WHERE id = ${taskID}`;
  } else {
    queryUpdateTask = `UPDATE tasks SET title = "${title}", description = "${description}", completed = ${isCompleted} WHERE id = ${taskID}`;
  }

  // verify that task exists in the todo
  await verifyTask(taskID, todoID);
  await db.query(queryUpdateTask);

  // Update Priority table
  if (priority) {
    let queryPriorityID = `SELECT id FROM priorities WHERE name = '${priority}'`;
    [[result]] = await db.query(queryPriorityID);
    priorityID = result.id;
  } else {
    priorityID = null;
  }

  let queryUpdateTaskPriority = `UPDATE tasks_priorities SET priority_id = ${priorityID} WHERE task_id = ${taskID}`;
  await db.query(queryUpdateTaskPriority);

  // Update files table
  // Delete files from file table
  let queryDeleteFile = `DELETE FROM files WHERE task_id = ${taskID}`;
  await db.query(queryDeleteFile);

  // Insert files into file table
  await insertFiles(file, taskID);
  res.status(StatusCodes.OK).json({ mssg: 'Task updated' });
};

// Function to delete todo
const deleteTask = async (req, res) => {
  const { todoID, taskID } = req.params;
  const { userID } = req.user;

  // Verify that todo belongs to this user
  await verifyTodo(todoID, userID);
  let queryDeleteTask = `DELETE FROM tasks WHERE id = ${taskID}`;

  // Verify that task exists in the todo
  await verifyTask(taskID, todoID);
  await db.query(queryDeleteTask);

  res.status(StatusCodes.OK).json({ mssg: 'Task deleted' });
};

const searchTask = async (req, res) => {
  const { userID } = req.user;
  const { query } = req.query;

  let querySearch = `
    SELECT tasks.id, tasks.title AS task_title, todos.title AS todo_title, priorities.name AS priority
    FROM tasks 
    JOIN todos ON tasks.todo_id = todos.id
    JOIN tasks_priorities ON tasks.id = tasks_priorities.task_id 
    LEFT JOIN priorities ON tasks_priorities.priority_id = priorities.id
    WHERE todo_id IN (SELECT id FROM todos WHERE user_id = ${userID}) AND tasks.title LIKE "%${query}%"
  `;
  const [result] = await db.query(querySearch);
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
