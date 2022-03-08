// setiap ada error panggil fungsi ini
const errorHandler = (statusCode, errorMessage, res) => {
  res.status(statusCode).json({
    message: errorMessage,
    status: "ERROR"
  })
}


module.exports = errorHandler