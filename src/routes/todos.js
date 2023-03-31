const express = require('express');
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todos');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

router.route('/').get(authenticateToken, getAllTodos).post(createTodo);
router.route('/:id').get(getTodo).patch(updateTodo).delete(deleteTodo);

module.exports = router;
