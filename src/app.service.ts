import { lastValueFrom } from 'rxjs';
import { Request, Response } from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ProxyConfig } from './config';
import { ResponseType } from './common';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly staticPath = resolve(__dirname, '..', 'public');

  private readonly proxyConfig = new ProxyConfig();

  constructor(private readonly httpService: HttpService) {}

  onApplicationBootstrap() {
    if (existsSync(this.staticPath) === false) {
      mkdirSync(this.staticPath);
    }
  }

  private parseExtension(pathname: string) {
    return pathname.split('/').pop()?.split('.')?.pop() ?? '';
  }

  private getResponseType(extension: string): ResponseType | undefined {
    if (['jpg', 'ttf', 'woff', 'woff2'].includes(extension)) {
      return 'arraybuffer';
    }
  }

  private saveFile(pathname: string, data: string, extension: string) {
    const dirpath = [this.staticPath].concat(pathname.split('/').slice(0, -1)).join('/');
    const filepath = [this.staticPath, pathname].join('/');

    mkdirSync(dirpath, { recursive: true });

    if (['jpg', 'ttf', 'woff', 'woff2'].includes(extension)) {
      writeFileSync(filepath, Buffer.from(data, 'binary'));
    } else {
      writeFileSync(filepath, data);
    }

    return filepath;
  }

  async getProxyTarget(req: Request, res: Response) {
    const pathname = req.path;
    const host = this.proxyConfig.getHost();
    const target = this.proxyConfig.getTarget();

    const extension = this.parseExtension(pathname);
    const responseType = this.getResponseType(extension);
    const response = await lastValueFrom(this.httpService.get<string>(target + pathname, { responseType }));

    if (['', 'php', 'html'].includes(extension)) {
      return res.send(response.data.replaceAll(target, host));
    }

    res.sendFile(this.saveFile(pathname, response.data, extension));
  }
}
