const db = require('../db/connect');
const { NotFoundError } = require('../errors');

// Function to verify that todo exists and belongs to the logged in user
const verifyTodo = async (todoID, userID) => {
  let queryTodo = `SELECT * FROM todos where id = ${todoID} AND user_id = ${userID}`;
  const [todo] = await db.query(queryTodo);
  if (todo.length == 0) {
    throw new NotFoundError('Todo does not exist');
  }
};

// Function to verify that task exists in the todo
const verifyTask = async (taskID, todoID) => {
  let queryTask = `SELECT * FROM tasks where id = ${taskID} AND todo_id = ${todoID}`;
  const [task] = await db.query(queryTask);
  if (task.length == 0) { 
    throw new NotFoundError('Task does not exist');
  }
};

// // Function to reset table to auto increment 1
// const resetTable = async table => {
//   let queryReset = `ALTER TABLE ${table} AUTO_INCREMENT = 1`;
//   await db.query(queryReset);
// };

module.exports = { verifyTodo, verifyTask };
