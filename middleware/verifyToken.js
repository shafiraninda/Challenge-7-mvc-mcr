const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/error')
// untuk verifikasi token user
const verifyToken = (req, res, next) => {
  try {
    let tokenHeader = req.headers['authorization']
    // check apakah token nya di kirim lewat header
    if (!tokenHeader) {
      return errorHandler(401, "No Token Provided", res)
    } else {
      // buang tulisan bearer yang ada dalam token
      let token = tokenHeader.split(' ')[1]

      // untuk buka kunci token yang sudah dikunci menggunakan method jwt.sign
      // kuncinya diambil dari .env
      // decoded adalah data dari token yang sudah dibuka menggunakan secret process.env.JWT_SECRET
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          // kasih error kalau proses buka kunci gagal, atau token sudah expired
          return errorHandler(403, error.message, res)
        } else {
          // simpan data user ke dalam req.user dan bisa diakses oleh seluruh controller yang ada
          // middleware verifyToken nya
          req.user = decoded
          // lanjut ke proses controller berikutnya
          next()
        }
      })
    }


  } catch (error) {
    console.log('=============verifyToken==================');
    console.log(error);
    console.log('=============verifyToken==================');
    return errorHandler(400, error.message, res)
  }
}

module.exports = verifyToken