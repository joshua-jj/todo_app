const express = require('express');
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  searchTask,
} = require('../controllers/tasksController');
const authenticateToken = require('../middlewares/authMiddleware');
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

router.route('/').get(authenticateToken, searchTask);

module.exports = router;
