import express from 'express';
import { uploadS3, deleteFromS3 } from '../config/s3.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = express.Router();

// Subir imagen única
router.post('/image/:folder', validarJWT, uploadS3.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        imageUrl: req.file.location,
        key: req.file.key,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error subiendo imagen',
      error: error.message
    });
  }
});

// Subir múltiples imágenes
router.post('/images/:folder', validarJWT, uploadS3.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes'
      });
    }

    const uploadedImages = req.files.map(file => ({
      imageUrl: file.location,
      key: file.key,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: `${req.files.length} imágenes subidas exitosamente`,
      data: uploadedImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error subiendo imágenes',
      error: error.message
    });
  }
});

// Eliminar imagen
router.delete('/image', validarJWT, async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere la key de la imagen'
      });
    }

    await deleteFromS3(key);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando imagen',
      error: error.message
    });
  }
});

export default router;