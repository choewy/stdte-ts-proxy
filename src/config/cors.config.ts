import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export class CorsConfig {
  private readonly configService = new ConfigService();

  private readonly ORIGIN = this.configService.get<string>('CORS_ORIGIN');

  getCorsOptions(): CorsOptions {
    return {
      origin: new RegExp(this.ORIGIN ?? ''),
    };
  }
}
