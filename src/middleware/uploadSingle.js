const streamUploadHelper = require('../utils/streamUploadCloudinary')

module.exports.uploadSingle = (req, res, next) => {
  if (req.file) {
    async function upload(req) {
      let result = await streamUploadHelper.streamUpload(req.file.buffer)
      req.body[req.file.fieldname] = result.url
      next()
    }
    upload(req)
  } else {
    next()
  }
}
