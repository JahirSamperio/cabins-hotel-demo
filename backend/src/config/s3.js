import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Configurar AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configurar multer para S3
export const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = req.params.folder || 'general';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Función para eliminar imagen de S3
export const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    throw new Error(`Error eliminando imagen: ${error.message}`);
  }
};

export default s3;