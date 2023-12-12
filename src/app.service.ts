import { lastValueFrom } from 'rxjs';
import { Request, Response } from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { AxiosError } from 'axios';

import { HttpException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { AppConfig, ProxyConfig } from './config';
import { AxiosException, InternalServerException, ResponseType } from './common';

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
      const response = await lastValueFrom(
        this.httpService.get<string>(target + pathname, { responseType, params: req.query }),
      );

      if (['', 'php', 'html', 'adm', 'english'].includes(extension)) {
        const split = target.split('://');
        const protocol = split[0];
        const origin = split[1];
        const www = `${protocol}://www.${origin}`;

        return res.send(response.data.replaceAll(target, host).replaceAll(www, host));
      }

      res.sendFile(this.saveFile(pathname, response.data, extension));
    } catch (e) {
      let exception: HttpException;

      if (e instanceof AxiosError) {
        exception = new AxiosException(e);
      } else {
        exception = new InternalServerException(e);
      }

      res.status(exception.getStatus()).send({
        ok: false,
        version: this.appConfig.getVersion(),
        data: {
          status: exception.getStatus(),
          name: exception.name,
          message: exception.message,
          cause: exception.cause,
        },
      });
    }
  }

  async requeestProxyTarget(req: Request, res: Response) {
    const target = this.proxyConfig.getTarget();

    try {
      const response = await lastValueFrom(
        this.httpService[req.method as 'post' | 'patch' | 'put']<string>(target + req.path, req.body, {
          params: req.query,
        }),
      );

      res.send(response.data);
    } catch (e) {
      let exception: HttpException;

      if (e instanceof AxiosError) {
        exception = new AxiosException(e);
      } else {
        exception = new InternalServerException(e);
      }

      res.status(exception.getStatus()).send({
        ok: false,
        version: this.appConfig.getVersion(),
        data: {
          status: exception.getStatus(),
          name: exception.name,
          message: exception.message,
          cause: exception.cause,
        },
      });
    }
  }

  private parseExtension(pathname: string) {
    return pathname.split('/').pop()?.split('.')?.pop() ?? '';
  }

  private getResponseType(extension: string): ResponseType | undefined {
    if (['ico', 'gif', 'jpg', 'png', 'ttf', 'woff', 'woff2', 'mp4'].includes(extension)) {
      return 'arraybuffer';
    }
  }

  private saveFile(pathname: string, data: string, extension: string) {
    const dirpath = [this.staticPath].concat(pathname.split('/').slice(0, -1)).join('/');
    const filepath = [this.staticPath, pathname].join('/');

    mkdirSync(dirpath, { recursive: true });

    if (['ico', 'gif', 'jpg', 'png', 'ttf', 'woff', 'woff2', 'mp4'].includes(extension)) {
      writeFileSync(filepath, Buffer.from(data, 'binary'));
    } else {
      writeFileSync(filepath, data);
    }

    return filepath;
  }
}
