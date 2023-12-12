import { lastValueFrom } from 'rxjs';
import { Request, Response } from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { HttpException, Injectable, InternalServerErrorException, OnApplicationBootstrap } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { AppConfig, ProxyConfig } from './config';
import { ResponseType } from './common';
import { AxiosError } from 'axios';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly staticPath = resolve(__dirname, '..', 'public');

  private readonly appConfig = new AppConfig();
  private readonly proxyConfig = new ProxyConfig();

  constructor(private readonly httpService: HttpService) {}

  onApplicationBootstrap() {
    if (existsSync(this.staticPath) === false) {
      mkdirSync(this.staticPath);
    }
  }

  getVersion() {
    return {
      ok: true,
      version: this.appConfig.getVersion(),
    };
  }

  async getProxyTarget(req: Request, res: Response) {
    const pathname = req.path;
    const host = this.proxyConfig.getHost();
    const target = this.proxyConfig.getTarget();

    const extension = this.parseExtension(pathname);
    const responseType = this.getResponseType(extension);

    try {
      const response = await lastValueFrom(this.httpService.get<string>(target + pathname, { responseType }));

      if (['', 'php', 'html'].includes(extension)) {
        return res.send(response.data.replaceAll(target, host));
      }

      res.sendFile(this.saveFile(pathname, response.data, extension));
    } catch (e) {
      let exception: HttpException;

      if (e instanceof AxiosError) {
        exception = new HttpException(e.response?.data, e.response?.status ?? 400);
      } else {
        exception = new InternalServerErrorException({
          name: e?.name,
          message: e?.message,
          cause: e?.cause,
        });
      }

      res.status(exception.getStatus()).send(exception);
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
}
