import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import * as mongoose from 'mongoose';

@Catch(mongoose.mongo.MongoServerError)
export class MongoServerExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError | MongoServerError, host: ArgumentsHost) {
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
