import { ConfigService } from '@nestjs/config';

export class AppConfig {
  private readonly configService = new ConfigService();

  private readonly VERSION = this.configService.get<string>('VERSION');

  getVersion() {
    return this.VERSION;
  }
}
