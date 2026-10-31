import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// Registro de eventos de seguridad de las cuentas: qué pasó, a qué cuenta y cuándo; nunca
// contraseñas, códigos ni datos del equipo. Se depuran solos a los 15 días (índice TTL).
// Si la base no responde, el evento se pierde pero el ingreso sigue.
export const EVENTOS = {
  ingreso: 'ingreso',
  claveErrada: 'clave_errada',
  codigoErrado: 'codigo_errado',
  cuentaBloqueada: 'cuenta_bloqueada',
  claveCambiada: 'clave_cambiada',
  recuperacion: 'recuperacion_solicitada',
  metodoActivado: 'metodo_activado',
} as const;

const RETENCION_DIAS = 15;

@Injectable()
export class AuditoriaService implements OnModuleInit {
  private readonly log = new Logger(AuditoriaService.name);

  constructor(@InjectConnection() private readonly conexion: Connection) {}

  private get eventos() {
    return this.conexion.collection('eventos_seguridad');
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.eventos.createIndex({ fecha: 1 }, { expireAfterSeconds: RETENCION_DIAS * 24 * 3600 });
      await this.eventos.createIndex({ usuario_id: 1 });
    } catch {
      this.log.warn('No se pudieron crear los índices de eventos de seguridad');
    }
  }

  async registrar(tipo: string, usuarioId: string): Promise<void> {
    try {
      await this.eventos.insertOne({ tipo, usuario_id: usuarioId, fecha: new Date() });
    } catch {
      this.log.warn(`No se pudo registrar el evento de seguridad ${tipo}`);
    }
  }
}
