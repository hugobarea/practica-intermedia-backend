const multer = require("multer");

/* Tal y como vimos en clase, le quito todo el código de storage en local ya que utilizaré sólo IPFS */

const memory = multer.memoryStorage();
const uploadMiddlewareMemory = multer({ storage: memory, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { uploadMiddlewareMemory };