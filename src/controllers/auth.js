const db = require('../db/connect')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { StatusCodes } = require('http-status-codes');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        let sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hash}')`;
        await db.query(sql);
        res.status(StatusCodes.CREATED).json({ mssg: 'User created' });
    } catch (err) {
        const arr = err.message.split(".");
        const length = arr.length;
        const duplicate = arr[length - 1];
        console.log(err.message.split("."));
        if (err.code === 'ER_DUP_ENTRY' && duplicate === "username'") {
          return res.status(StatusCodes.CONFLICT).send('Username already exists.');
        }

        if (err.code === 'ER_DUP_ENTRY' && duplicate === "email'") {
          return res.status(StatusCodes.CONFLICT).res.send('Email already exists.');
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err})
    }
}

const login = (req, res) => {
    res.send('User logged in');
}

module.exports = { register, login };