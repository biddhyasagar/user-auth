import multer from 'koa-multer';
import path from 'path';
import fs from 'fs';


if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}


const storage = multer.diskStorage({
    destination: (ctx, file, cb) => {
        cb(null, './uploads'); 
    },
    filename: (ctx, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: (ctx, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; 
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true); 
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png)')); 
        }
    },
    limits: { fileSize: 20 * 1024 * 1024 }, 
});

export default upload; 