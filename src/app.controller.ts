import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  getHealth(@Res() res: Response): void {
    res.status(HttpStatus.OK).send({
      status: 'OK',
      message: 'Service is up and running',
    });
  }
}
