require('express-async-errors');
const db = require('../db/connect');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, AuthorizationError } = require('../errors');
const register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    throw new BadRequestError('Please provide all fields.');
  }

  if (password !== confirmPassword) {
    throw new BadRequestError("Passwords don't match.");
  }

  let queryUser = `SELECT * FROM users where username='${username}'`;
  let [result] = await db.query(queryUser);

  if (result.length == 1) throw new BadRequestError('Username already exists.');

  let queryEmail = `SELECT * FROM users where email='${email}'`;
  [result] = await db.query(queryEmail);

  if (result.length == 1) throw new BadRequestError('Email already exists.');

  const hash = await bcrypt.hash(password, 10);
  let queryInsert = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hash}')`;

  await db.query(queryInsert);
  res.status(StatusCodes.CREATED).json({ mssg: 'User created' });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    throw new BadRequestError('Please provide username and password');

  let query = `SELECT * FROM users WHERE username='${username}'`;
  const [[result]] = await db.query(query);
  if (!result) throw new AuthorizationError('Invalid username or password');

  let match = await bcrypt.compare(password, result.password);

  if (!match) throw new AuthorizationError('Invalid username or password');
  const { user_id: id } = result;
  const token = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30d',
  });
  res.status(StatusCodes.OK).json({ mssg: result, token });
};

module.exports = { register, login };
