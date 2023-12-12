import { Request, Response } from 'express';

import { Controller, Get, Patch, Post, Put, Req, Res } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    return this.appService.getVersion();
  }

  @Get('*')
  async getProxyTarget(@Req() req: Request, @Res() res: Response) {
    return this.appService.getProxyTarget(req, res);
  }

  @Post('*')
  async postProxyTarget(@Req() req: Request, @Res() res: Response) {
    return this.appService.requeestProxyTarget(req, res);
  }

  @Patch('*')
  async patchProxyTarget(@Req() req: Request, @Res() res: Response) {
    return this.appService.requeestProxyTarget(req, res);
  }

  @Put('*')
  async putProxyTarget(@Req() req: Request, @Res() res: Response) {
    return this.appService.requeestProxyTarget(req, res);
  }
}
