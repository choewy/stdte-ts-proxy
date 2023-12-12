import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '@proxy/common';

export class SystemConfig {
  private readonly configService = new ConfigService();

  private readonly TZ = this.configService.get<string>('TZ') as string;
  private readonly NODE_ENV = this.configService.get<string>('NODE_ENV');

  getTimezone() {
    return this.TZ;
  }

  getNodeEnv() {
    return this.NODE_ENV as NodeEnv;
  }
}
