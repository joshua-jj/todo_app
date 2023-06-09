const express = require('express');
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todosController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router
  .route('/')
  .get(authenticateToken, getAllTodos)
  .post(authenticateToken, createTodo);
router
  .route('/:todoID')
  .get(authenticateToken, getTodo)
  .patch(authenticateToken, updateTodo)
  .delete(authenticateToken, deleteTodo);

module.exports = router;
