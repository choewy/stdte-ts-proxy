import { ConfigService } from '@nestjs/config';

export class ProxyConfig {
  private readonly configService = new ConfigService();

  private readonly HOST = this.configService.get<string>('PROXY_HOST') as string;
  private readonly TARGET = this.configService.get<string>('PROXY_TARGET') as string;

  getHost() {
    return this.HOST;
  }

  getTarget() {
    return this.TARGET;
  }
}
