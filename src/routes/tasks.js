const express = require('express');
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/tasks');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

router
  .route('/:todoID/tasks')
  .get(authenticateToken, getAllTasks)
  .post(authenticateToken, createTask);
router
  .route('/:todoID/tasks/:taskID')
  .get(authenticateToken, getTask)
  .patch(authenticateToken, updateTask)
  .delete(authenticateToken, deleteTask);

module.exports = router;
