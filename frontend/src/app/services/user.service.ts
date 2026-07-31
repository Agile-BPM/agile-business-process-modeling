import {Injectable} from "@angular/core";
import {BaseService} from "./base-service";
import { HttpClient, HttpContext } from "@angular/common/http";
import {ApiConfiguration} from "./api-configuration";
import {UserDto} from "./data/user-dto";
import {StrictHttpResponse} from "./strict-http-response";
import {Observable} from "rxjs";
import {getUser} from "./functions/user/get-user";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class UserService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  getUser$Response(context?: HttpContext): Observable<StrictHttpResponse<UserDto>> {
    return getUser(this.http, this.rootUrl, context);
  }

  getUser(context?: HttpContext): Observable<UserDto> {
    return this.getUser$Response(context).pipe(
      map((r: StrictHttpResponse<UserDto>): UserDto => r.body)
    );
  }
}
