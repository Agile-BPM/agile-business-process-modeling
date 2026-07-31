import {BaseService} from "./base-service";
import {Injectable} from "@angular/core";
import {ApiConfiguration} from "./api-configuration";
import { HttpClient, HttpContext } from "@angular/common/http";
import {StrictHttpResponse} from "./strict-http-response";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {initiateOauth, Initiate$Params} from "./functions/jira-oauth/initiate-oauth";
import {confirmOauth, Confirm$Params} from "./functions/jira-oauth/confirm-oauth";

@Injectable({
  providedIn: "root",
})
export class JiraOauthService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  initiateOauth$Response(params: Initiate$Params, context?: HttpContext): Observable<StrictHttpResponse<string>> {
    return initiateOauth(this.http, this.rootUrl, params, context);
  }

  initiateOauth(params: Initiate$Params, context?: HttpContext): Observable<string> {
    return this.initiateOauth$Response(params, context).pipe(
      map((r: StrictHttpResponse<string>): string => r.body as string)
    );
  }

  confirmOauth$Response(params: Confirm$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return confirmOauth(this.http, this.rootUrl, params, context);
  }

  confirmOauth(params: Confirm$Params, context?: HttpContext): Observable<void> {
    return this.confirmOauth$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
