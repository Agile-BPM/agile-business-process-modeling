import {Injectable} from "@angular/core";
import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import {TokenService} from "../token/token-service";

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.tokenService.token;
    if (token) {
      const authReq = req.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      });
      return next.handle(authReq)
    }
    return next.handle(req);
  }
}
