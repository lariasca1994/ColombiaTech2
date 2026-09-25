/**
 * Crea o asciende a admin las cuentas indicadas. Conecta directo a Mongo
 * con DB_URL (mismo .env que usa el backend) -- no pasa por la API HTTP,
 * así que la contraseña nunca queda en ningún log de requests.
 *
 * Uso:
 *   npm run crear:admin -- correo1@ejemplo.com,correo2@ejemplo.com "Nombre" LaContraseña
 *
 * o con variables de entorno (útil para no dejar la contraseña en el
 * historial de la shell):
 *   ADMIN_EMAILS=correo1@ejemplo.com,correo2@ejemplo.com \
 *   ADMIN_NOMBRE="Nombre" \
 *   ADMIN_PASSWORD=LaContraseña \
 *   npm run crear:admin
 *
 * Si la cuenta ya existe, la asciende a role: 'admin' sin tocar su
 * contraseña actual (a menos que también se pase ADMIN_PASSWORD, en cuyo
 * caso también se la actualiza). Si no existe, la crea directamente con
 * role: 'admin' -- nunca pasa por el registro público, que no acepta ese
 * campo (ver CreateUserDto).
 */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserSchema } from '../users/user.schema';

dotenv.config();

async function main() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    throw new Error('Falta DB_URL en el .env');
  }

  const argEmails = process.argv[2];
  const argNombre = process.argv[3];
  const argPassword = process.argv[4];

  const emailsRaw = argEmails || process.env.ADMIN_EMAILS;
  const nombre = argNombre || process.env.ADMIN_NOMBRE || 'Administrador';
  const password = argPassword || process.env.ADMIN_PASSWORD;

  if (!emailsRaw) {
    throw new Error(
      'Falta la lista de correos (argumento 1, o ADMIN_EMAILS separados por coma)',
    );
  }
  const emails = emailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) {
    throw new Error('La lista de correos quedó vacía');
  }

  await mongoose.connect(dbUrl);
  const UserModel = mongoose.model('User', UserSchema);

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  for (const email of emails) {
    const existente = await UserModel.findOne({ email });
    if (existente) {
      const cambios: any = { role: 'admin', active: true };
      if (hashedPassword) cambios.password = hashedPassword;
      await UserModel.updateOne({ email }, { $set: cambios });
      console.log(
        `✅ ${email}: ascendido a admin${hashedPassword ? ' (contraseña actualizada)' : ''}`,
      );
    } else {
      if (!hashedPassword) {
        console.log(
          `⚠️  ${email}: no existe y no se pasó ADMIN_PASSWORD -- no se puede crear sin contraseña, se omite`,
        );
        continue;
      }
      await UserModel.create({
        name: nombre,
        email,
        password: hashedPassword,
        role: 'admin',
        active: true,
      });
      console.log(`✅ ${email}: cuenta admin creada`);
    }
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('❌', error.message);
  process.exit(1);
});
