import { Request, Response } from 'express';

import { Controller, Get, Req, Res } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('*')
  async getProxyTarget(@Req() req: Request, @Res() res: Response) {
    return this.appService.getProxyTarget(req, res);
  }
}
