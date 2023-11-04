import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import * as MongooseError from 'mongoose/lib/error';

@Catch(MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const errorMsg = exception?.toString()
      ? exception.toString()
      : 'Internal Server Error';

    const errorObj = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: errorMsg,
    };

    response.status(errorObj.statusCode).json(errorObj);
  }
}
