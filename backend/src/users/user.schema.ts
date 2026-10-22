import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  // 'admin' solo se asigna vía el script de seed (src/scripts/crear-admin.ts)
  // -- nunca desde el registro público ni desde UpdateUserDto (ver ese DTO).
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Cuenta suspendida por un admin: no puede volver a loguearse (ver
  // jwt.strategy.ts) hasta que un admin la reactive.
  active: { type: Boolean, default: true },
  // Verificación en dos pasos (auth/mfa.service.ts): clave TOTP cifrada y código del
  // correo como huella. Nunca sale en las respuestas: solo se lee con select('+mfa').
  mfa: { type: mongoose.Schema.Types.Mixed, select: false },
});
