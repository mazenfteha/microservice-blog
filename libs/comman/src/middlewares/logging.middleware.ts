import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    constructor(private logger: Logger){}
    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl: url } = req;
        const reqTime = Date.now();

        res.on('finish', () => this.logRequest({ method, url, reqTime, statusCode: res.statusCode }));
        next();
    }

    private logRequest({ method, url, reqTime, statusCode }: { method: string; url: string; reqTime: number; statusCode: number }): void {
        const resTime = Date.now();
        const responseTime = `${resTime - reqTime}ms`;
        const logMessage = `${method} ${url} - ${responseTime}`;

        if ([404, 500, 401].includes(statusCode)) {
            this.logger.error(`${logMessage} Status: ${statusCode}`);
        } else {
            this.logger.log(logMessage);
        }
    }
}