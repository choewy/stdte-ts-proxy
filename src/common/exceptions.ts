import { AxiosError } from 'axios';

import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

export class AxiosException extends BadRequestException {
  constructor(e: AxiosError) {
    super();

    this.cause = e.response?.data;
  }
}

export class InternalServerException extends InternalServerErrorException {
  constructor(e?: Error) {
    super();

    this.cause = {
      name: e?.name,
      message: e?.message,
      cause: e?.cause,
    };
  }
}
