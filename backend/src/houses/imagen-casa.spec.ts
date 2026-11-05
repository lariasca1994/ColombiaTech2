import { generarImagenCasa, svgCasa, varianteDe } from './imagen-casa';
import { publicIdDesdeUrl } from '../imagenes/cloudinary';

describe('imagen automática de las casas', () => {
  const base = { code: 'H-1024', type: 'Apartamento', city: 'Medellín', state: 'Antioquia', rooms: 3, bathrooms: 2, size: 85, parking: 'Sí', price: 350000000 };

  it('elige la ilustración según el tipo de inmueble', () => {
    expect(varianteDe('Apto dúplex')).toBe('edificio');
    expect(varianteDe('Finca campestre')).toBe('finca');
    expect(varianteDe('Local comercial')).toBe('local');
    expect(varianteDe('Casa')).toBe('casa');
    expect(varianteDe('')).toBe('casa');
  });

  it('es determinista por código y distinta entre casas', () => {
    expect(svgCasa(base)).toBe(svgCasa(base));
    expect(svgCasa(base)).not.toBe(svgCasa({ ...base, code: 'H-2048' }));
  });

  it('muestra los datos de la casa y escapa el texto del usuario', () => {
    const svg = svgCasa({ ...base, city: '<script>alert(1)</script>' });
    expect(svg).toContain('3 hab');
    expect(svg).toContain('85 m²');
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('sin Cloudinary devuelve un data URI (desarrollo y pruebas)', async () => {
    delete process.env.CLOUDINARY_API_SECRET;
    const url = await generarImagenCasa(base);
    expect(url.startsWith('data:image/svg+xml;base64,')).toBe(true);
  });

  it('reconoce el public_id solo de las imágenes del proyecto', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'nube';
    expect(publicIdDesdeUrl('https://res.cloudinary.com/nube/image/upload/v17/colombiatech2/casas/h-1024-ab12cd34.png'))
      .toBe('colombiatech2/casas/h-1024-ab12cd34');
    expect(publicIdDesdeUrl('https://res.cloudinary.com/nube/image/upload/c_fill,w_400/v3/colombiatech2/abc.jpg'))
      .toBe('colombiatech2/abc');
    expect(publicIdDesdeUrl('https://res.cloudinary.com/otra/image/upload/v1/colombiatech2/x.png')).toBeNull();
    expect(publicIdDesdeUrl('https://res.cloudinary.com/nube/image/upload/v1/otro/x.png')).toBeNull();
  });
});
