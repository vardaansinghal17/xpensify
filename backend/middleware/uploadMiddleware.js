import multer from "multer"

const storage = multer.diskStorage({
    destination:(req, file, callback)=>{
        callback(null, "uploads");
    },
    filename:(req,file, callback)=>{
        const newFileName = `${Date.now()}-${file.originalname}`;
        callback(null, newFileName);
    }
});

const fileFilter = (req,file,callback)=>{
    const allowedTypes = ['image/jpeg','image/png','image/jpg'];

    if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only .jpeg, .jpg, and .png image formats are allowed!'), false);
  }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});
export default upload ;