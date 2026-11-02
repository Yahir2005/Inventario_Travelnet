const Imagen_Instalacion = require('../model/Imagen_Instalacion');
const path = require('path');
const crypto = require('crypto');
const fsPromises = require('fs/promises');

/**
 * ============================================================================
 * CONTROLADOR DE IMÁGENES DE INSTALACIÓN (imagen_InstalacionController.js)
 * ============================================================================
 * Gestiona el almacenamiento de fotografías de evidencia técnica.
 * Cuando recibe una imagen en formato Base64 (`data:image/jpeg;base64,...`),
 * valida que sea un formato de imagen seguro, la guarda físicamente en la
 * carpeta `public/uploads/` de forma asíncrona y registra su ruta en MariaDB.
 */
const BASE64_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

/** Obtiene todas las imágenes de instalación registradas */
const getAll = async (req, res) => {
    try {
        const imagen_Instalacion = await Imagen_Instalacion.findAll(req.db);
        res.json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Obtiene una imagen de instalación específica por su ID */
const getById = async (req, res) => {
    try {
        const imagen_Instalacion = await Imagen_Instalacion.findByPk(req.db, req.params.id);
        if(!imagen_Instalacion) return res.status(404).json({ error: 'Imagen instalación no encontrada' });
        res.json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Convierte la imagen Base64 en un archivo `.jpg` en disco y guarda la referencia en la BD */
const create = async (req, res) => {
    try {
        if (req.body.Ruta_Imagen && req.body.Ruta_Imagen.startsWith('data:')) {
            if (!BASE64_IMAGE_REGEX.test(req.body.Ruta_Imagen)) {
                return res.status(400).json({ error: 'Formato de imagen no válido. Solo se permiten JPEG, PNG o WEBP.' });
            }
            const base64Data = req.body.Ruta_Imagen.replace(BASE64_IMAGE_REGEX, '');
            const nombreArchivo = `evidencia_${crypto.randomUUID()}.jpg`;
            const dirUploads = path.join(__dirname, '../../public/uploads');
            await fsPromises.mkdir(dirUploads, { recursive: true });
            const rutaFisica = path.join(dirUploads, nombreArchivo);
            await fsPromises.writeFile(rutaFisica, Buffer.from(base64Data, 'base64'));
            req.body.Ruta_Imagen = `/uploads/${nombreArchivo}`;
        }
        const imagen_Instalacion = await Imagen_Instalacion.create(req.db, req.body);
        
        res.status(201).json(imagen_Instalacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/** Actualiza los metadatos de una imagen de instalación existente */
const update = async (req, res) => {
    try {
        const exist = await Imagen_Instalacion.findByPk(req.db, req.params.id);
        if(!exist) return res.status(404).json({ error: 'Imagen instalación no encontrada' });

        const instalacion_ImagenUpdated = await Imagen_Instalacion.update(req.db, req.params.id, req.body);
        res.json(instalacion_ImagenUpdated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAll, getById, create, update };