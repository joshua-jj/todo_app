const db = require('../db/connect');
const path = require('path');
const { unlinkSync } = require('fs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const cloudinary = require('cloudinary').v2;
const { verifyTodo, verifyTask } = require('./helperController');

const uploadTaskFile = async (req, res) => {
  const { todoID } = req.params;
  const { userID } = req.user;

  //* Verify that todo belongs to this user
  await verifyTodo(todoID, userID);

  const { file } = req.files;
  if (!file) throw new BadRequestError('No file uploaded');
  //! Check if file size limit (10MB) is exceeded
  if (file.size > process.env.MAX_FILE_SIZE)
    throw new BadRequestError('File should be less than 10MB');
  const { tempFilePath } = file;
  const result = await cloudinary.uploader.upload(tempFilePath, {
    use_filename: true,
    folder: 'Todo App',
  });
  unlinkSync(tempFilePath);
  res.status(StatusCodes.OK).json({ file: result.secure_url });
};

module.exports = { uploadTaskFile };
