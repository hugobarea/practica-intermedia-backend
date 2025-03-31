const multer = require("multer");

/* Tal y como vimos en clase, le quito todo el codigo de storage en local ya que utilizare solo IPFS */

const memory = multer.memoryStorage();
const uploadMiddlewareMemory = multer({ storage: memory, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { uploadMiddlewareMemory };