import { createHash } from 'node:crypto';
import { cloudinary, cloudinaryConfigurado } from '../imagenes/cloudinary';

/**
 * Imagen generada automáticamente para cada casa: una ilustración propia (SVG) que cambia según el
 * tipo de inmueble (edificio, finca, local o casa), sus datos (habitaciones, baños, área,
 * parqueadero) y una paleta elegida a partir del código, de modo que cada casa se ve distinta y la
 * misma casa siempre produce la misma imagen. Se sube a Cloudinary y se entrega como PNG.
 */
export interface DatosCasa {
  code: string;
  type?: string;
  city?: string;
  state?: string;
  rooms?: number;
  bathrooms?: number;
  size?: number;
  parking?: string;
  price?: number;
}

type Variante = 'edificio' | 'finca' | 'local' | 'casa';

const PALETAS = [
  { cielo: ['#7dd3fc', '#e0f2fe'], sol: '#fde047', montes: ['#4d7c0f', '#65a30d'], fachada: '#f8fafc', techo: '#b45309', acento: '#0e7490' },
  { cielo: ['#fb923c', '#fde68a'], sol: '#fff7ed', montes: ['#7c2d12', '#9a3412'], fachada: '#fef3c7', techo: '#7f1d1d', acento: '#be123c' },
  { cielo: ['#a5b4fc', '#e0e7ff'], sol: '#fef9c3', montes: ['#3730a3', '#4f46e5'], fachada: '#f1f5f9', techo: '#334155', acento: '#4338ca' },
  { cielo: ['#1e3a8a', '#6366f1'], sol: '#f8fafc', montes: ['#0f172a', '#1e293b'], fachada: '#e2e8f0', techo: '#475569', acento: '#f59e0b' },
  { cielo: ['#5eead4', '#ccfbf1'], sol: '#fef08a', montes: ['#115e59', '#0f766e'], fachada: '#fffbeb', techo: '#9a3412', acento: '#0f766e' },
  { cielo: ['#f9a8d4', '#fce7f3'], sol: '#fff1f2', montes: ['#9d174d', '#be185d'], fachada: '#fdf2f8', techo: '#831843', acento: '#9d174d' },
];

export function varianteDe(tipo = ''): Variante {
  const t = tipo.toLowerCase();
  if (/apart|apto|apt\b|edific|duplex|dúplex|penthouse|torre|loft/.test(t)) return 'edificio';
  if (/finca|campestre|rural|hacienda|caba|chalet|lote|granja/.test(t)) return 'finca';
  if (/local|oficina|bodega|comercial|consultorio/.test(t)) return 'local';
  return 'casa';
}

function semilla(codigo: string): number {
  return createHash('sha256').update(codigo).digest().readUInt32BE(0);
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function recortar(texto: string, max: number): string {
  const limpio = (texto || '').replace(/\s+/g, ' ').trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
}

function conParqueadero(parking?: string): boolean {
  return /^(s[ií]|yes|true|1|garaje|garage|cubierto|privado)/i.test((parking || '').trim());
}

function ventanas(x: number, y: number, cols: number, filas: number, w: number, h: number, gx: number, gy: number, color: string, luz: string, n: number): string {
  let s = '';
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      const encendida = ((n >> ((f * cols + c) % 24)) & 1) === 1;
      s += `<rect x="${x + c * (w + gx)}" y="${y + f * (h + gy)}" width="${w}" height="${h}" rx="3" fill="${encendida ? luz : color}"/>`;
    }
  }
  return s;
}

function edificio(p: (typeof PALETAS)[number], d: DatosCasa, n: number): string {
  const pisos = Math.min(9, Math.max(4, 3 + Math.round((d.rooms || 2) * 1.2)));
  const alto = pisos * 38 + 40;
  const y = 470 - alto;
  return `
  <rect x="300" y="${y}" width="200" height="${alto}" rx="6" fill="${p.fachada}" stroke="#0f172a" stroke-opacity=".15" stroke-width="2"/>
  <rect x="290" y="${y - 14}" width="220" height="18" rx="4" fill="${p.techo}"/>
  ${ventanas(318, y + 20, 4, pisos, 30, 24, 14, 14, '#94a3b8', '#fde68a', n)}
  <rect x="372" y="${470 - 46}" width="56" height="46" rx="4" fill="${p.acento}"/>
  <rect x="210" y="${470 - 150}" width="80" height="150" rx="5" fill="${p.fachada}" opacity=".85"/>
  ${ventanas(222, 470 - 136, 2, 4, 22, 18, 12, 14, '#cbd5e1', '#fde68a', n >> 3)}
  <rect x="510" y="${470 - 190}" width="90" height="190" rx="5" fill="${p.fachada}" opacity=".85"/>
  ${ventanas(522, 470 - 176, 2, 5, 26, 18, 14, 14, '#cbd5e1', '#fde68a', n >> 5)}`;
}

function finca(p: (typeof PALETAS)[number], d: DatosCasa, n: number): string {
  const arboles = [130, 175, 620, 670].map((x, i) => `
  <rect x="${x - 5}" y="400" width="10" height="70" fill="#78350f"/>
  <circle cx="${x}" cy="${385 - (i % 2) * 12}" r="${34 + ((n >> i) & 7)}" fill="${p.montes[i % 2]}"/>`).join('');
  const cerca = Array.from({ length: 22 }, (_, i) => `<rect x="${60 + i * 32}" y="448" width="6" height="30" fill="#a16207"/>`).join('');
  return `${arboles}
  <rect x="270" y="330" width="260" height="140" rx="4" fill="${p.fachada}" stroke="#0f172a" stroke-opacity=".12" stroke-width="2"/>
  <path d="M250 335 L400 245 L550 335 Z" fill="${p.techo}"/>
  <rect x="250" y="335" width="300" height="10" fill="#0f172a" opacity=".12"/>
  <rect x="375" y="395" width="50" height="75" rx="4" fill="${p.acento}"/>
  ${ventanas(295, 365, 2, 1, 50, 40, 20, 0, '#bae6fd', '#fde68a', n)}
  ${ventanas(450, 365, 1, 1, 50, 40, 0, 0, '#bae6fd', '#fde68a', n >> 2)}
  <rect x="60" y="452" width="690" height="5" fill="#a16207"/>${cerca}`;
}

function local(p: (typeof PALETAS)[number], d: DatosCasa, n: number): string {
  return `
  <rect x="220" y="300" width="360" height="170" rx="6" fill="${p.fachada}" stroke="#0f172a" stroke-opacity=".15" stroke-width="2"/>
  <rect x="210" y="285" width="380" height="26" rx="5" fill="${p.techo}"/>
  <rect x="300" y="250" width="200" height="34" rx="8" fill="${p.acento}"/>
  <text x="400" y="273" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" font-family="Arial, Helvetica, sans-serif">${escapar(recortar(d.type || 'Local', 18)).toUpperCase()}</text>
  <path d="M230 311 h340 l-14 30 h-312 z" fill="${p.acento}" opacity=".85"/>
  ${ventanas(244, 356, 3, 1, 70, 86, 18, 0, '#bae6fd', '#e0f2fe', n)}
  <rect x="500" y="356" width="56" height="114" rx="4" fill="${p.techo}"/>`;
}

function casa(p: (typeof PALETAS)[number], d: DatosCasa, n: number): string {
  const garaje = conParqueadero(d.parking);
  const anchoVentanas = Math.min(4, Math.max(2, d.rooms || 2));
  return `
  <rect x="250" y="320" width="${garaje ? 240 : 300}" height="150" rx="4" fill="${p.fachada}" stroke="#0f172a" stroke-opacity=".12" stroke-width="2"/>
  <path d="M228 325 L${garaje ? 370 : 400} 225 L${garaje ? 512 : 572} 325 Z" fill="${p.techo}"/>
  <rect x="${garaje ? 340 : 370}" y="${garaje ? 230 : 236}" width="22" height="40" fill="${p.techo}"/>
  <rect x="${garaje ? 345 : 375}" y="392" width="50" height="78" rx="4" fill="${p.acento}"/>
  <circle cx="${garaje ? 386 : 416}" cy="433" r="3" fill="#fde68a"/>
  ${ventanas(268, 345, Math.min(anchoVentanas, garaje ? 1 : 2), 1, 52, 38, 16, 0, '#bae6fd', '#fde68a', n)}
  ${ventanas(garaje ? 410 : 448, 345, 1, 1, 52, 38, 0, 0, '#bae6fd', '#fde68a', n >> 1)}
  ${garaje ? `<rect x="490" y="360" width="120" height="110" rx="4" fill="${p.fachada}" stroke="#0f172a" stroke-opacity=".12" stroke-width="2"/>
  <path d="M482 365 L550 325 L618 365 Z" fill="${p.techo}"/>
  ${Array.from({ length: 5 }, (_, i) => `<rect x="505" y="${385 + i * 16}" width="90" height="11" rx="2" fill="#cbd5e1"/>`).join('')}` : ''}`;
}

function formatoPrecio(precio?: number): string {
  if (!precio || !Number.isFinite(precio)) return '';
  return `$ ${Math.round(precio).toLocaleString('es-CO')}`;
}

export function svgCasa(d: DatosCasa): string {
  const n = semilla(d.code || 'casa');
  const p = PALETAS[n % PALETAS.length];
  const variante = varianteDe(d.type);
  const noche = p.cielo[0] === '#1e3a8a';
  const solX = 120 + (n % 520);
  const cuerpo = { edificio, finca, local, casa }[variante](p, d, n);
  const datos = [
    d.rooms ? `${d.rooms} ${d.rooms === 1 ? 'habitación' : 'hab'}` : '',
    d.bathrooms ? `${d.bathrooms} ${d.bathrooms === 1 ? 'baño' : 'baños'}` : '',
    d.size ? `${Math.round(d.size)} m²` : '',
    conParqueadero(d.parking) ? 'parqueadero' : '',
  ].filter(Boolean).join('  ·  ');
  const lugar = [recortar(d.city || '', 28), recortar(d.state || '', 24)].filter(Boolean).join(', ');
  const precio = formatoPrecio(d.price);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.cielo[0]}"/><stop offset="1" stop-color="${p.cielo[1]}"/></linearGradient>
    <linearGradient id="velo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f172a" stop-opacity="0"/><stop offset="1" stop-color="#0f172a" stop-opacity=".78"/></linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#cielo)"/>
  <circle cx="${solX}" cy="${90 + (n % 50)}" r="${noche ? 30 : 42}" fill="${p.sol}" opacity="${noche ? 0.95 : 0.9}"/>
  ${noche ? Array.from({ length: 18 }, (_, i) => `<circle cx="${(n >> (i % 20)) % 790 + 5}" cy="${20 + ((i * 37 + n) % 180)}" r="1.6" fill="#fff" opacity=".8"/>`).join('') : `<ellipse cx="${(solX + 260) % 760}" cy="120" rx="70" ry="20" fill="#fff" opacity=".7"/><ellipse cx="${(solX + 480) % 760}" cy="80" rx="54" ry="15" fill="#fff" opacity=".6"/>`}
  <path d="M0 330 Q140 ${230 + (n % 40)} 290 310 T560 ${290 + (n % 30)} T800 300 V600 H0 Z" fill="${p.montes[0]}" opacity=".55"/>
  <path d="M0 380 Q180 ${320 + (n % 25)} 380 370 T800 350 V600 H0 Z" fill="${p.montes[1]}" opacity=".7"/>
  <rect x="0" y="468" width="800" height="132" fill="#3f6212"/>
  <rect x="0" y="468" width="800" height="8" fill="#4d7c0f"/>
  <path d="M370 470 L430 470 L470 600 L330 600 Z" fill="#d6d3d1" opacity=".55"/>
  ${cuerpo}
  <rect x="0" y="430" width="800" height="170" fill="url(#velo)"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="36" y="520" font-size="30" font-weight="700" fill="#ffffff">${escapar(recortar(d.type || 'Inmueble', 30))}</text>
    <text x="36" y="552" font-size="19" fill="#e2e8f0">${escapar(lugar)}</text>
    <text x="36" y="580" font-size="16" fill="#cbd5e1">${escapar(datos)}</text>
    ${precio ? `<text x="764" y="580" text-anchor="end" font-size="24" font-weight="700" fill="#fde68a">${escapar(precio)}</text>` : ''}
    <rect x="${764 - Math.min(220, 14 + recortar(d.code, 22).length * 10)}" y="24" width="${Math.min(220, 14 + recortar(d.code, 22).length * 10)}" height="30" rx="15" fill="#0f172a" opacity=".55"/>
    <text x="${764 - Math.min(220, 14 + recortar(d.code, 22).length * 10) / 2}" y="44" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${escapar(recortar(d.code, 22))}</text>
  </g>
</svg>`;
}

function publicIdDe(codigo: string): string {
  const limpio = codigo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 80);
  return `colombiatech2/casas/${limpio || 'casa'}-${createHash('sha256').update(codigo).digest('hex').slice(0, 8)}`;
}

/**
 * Genera la imagen de la casa y devuelve su URL. Con Cloudinary configurado se sube (sobrescribe la
 * anterior de la misma casa) y se entrega como PNG; sin él (desarrollo y pruebas), como data URI.
 */
export async function generarImagenCasa(d: DatosCasa): Promise<string> {
  const svg = svgCasa(d);
  const datos = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  if (!cloudinaryConfigurado()) return datos;
  const subida = await cloudinary.uploader.upload(datos, {
    public_id: publicIdDe(d.code),
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });
  return cloudinary.url(subida.public_id, { secure: true, format: 'png', version: subida.version });
}

export async function borrarImagen(publicId: string | null): Promise<void> {
  if (!publicId || !cloudinaryConfigurado()) return;
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}
