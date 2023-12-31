const multer = require("multer");

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "./uploads/");
  // },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// const upload = multer({ storage: multer.memoryStorage() });
const uploadImages = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
  limits: { fileSize: 5000000 },
});

module.exports = { storage, uploadImages };
