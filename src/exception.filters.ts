import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import {Response, Request} from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400){
      const errorResponse = {
        errorsMessages : []
      }
      const res: any = exception.getResponse()
      console.log(res);
      try{
        res.message.forEach(m => errorResponse.errorsMessages.push({ message : m, field : m.split(' ')[0] }))
        response.status(status).json(errorResponse)
      } catch (e) {
        response.sendStatus(status)
      }


    } else {
      response
        .status(status)
        .json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url
        });
    }
  }
}