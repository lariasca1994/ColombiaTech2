import { v2 as cloudinary } from 'cloudinary';

// Una sola configuración de Cloudinary para las subidas de los usuarios y las imágenes generadas
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function cloudinaryConfigurado(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );
}

/**
 * public_id de una imagen de esta cuenta a partir de su URL de entrega (para borrarla junto con la casa).
 * Devuelve null si la URL no es de esta cuenta o no está en las carpetas del proyecto.
 */
export function publicIdDesdeUrl(url?: string | null): string | null {
  if (!url || !process.env.CLOUDINARY_CLOUD_NAME) return null;
  const prefijo = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (!url.startsWith(prefijo)) return null;
  const resto = url
    .slice(prefijo.length)
    .split('/')
    // Fuera la versión y las transformaciones (c_fill,w_400, f_auto, q_auto…)
    .filter((parte) => !/^v\d+$/.test(parte) && !parte.includes(',') && !/^(a|ar|b|c|dpr|e|f|fl|g|h|q|r|t|w|x|y)_[^/]+$/.test(parte))
    .join('/');
  const publicId = resto.replace(/\.[a-z0-9]+$/i, '');
  return publicId.startsWith('colombiatech2/') ? publicId : null;
}

export { cloudinary };
