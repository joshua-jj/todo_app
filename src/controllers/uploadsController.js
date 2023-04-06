const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const uploadTaskFile = async (req, res) => {
    res.send('File uploaded');
}

module.exports = {uploadTaskFile}
