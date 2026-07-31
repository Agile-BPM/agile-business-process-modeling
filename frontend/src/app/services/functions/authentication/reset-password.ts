import {ResetPasswordRequest} from "../../api/reset-password-request";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {StrictHttpResponse} from "../../strict-http-response";
import {RequestBuilder} from "../../request-builder";
import {Observable} from "rxjs";
import {filter, map} from "rxjs/operators";

export interface ResetPassword$Params {
  body: ResetPasswordRequest
}

export function resetPassword(http: HttpClient, rootUrl: string, params: ResetPassword$Params, context?: HttpContext): Observable<StrictHttpResponse<{}>> {
  const rb = new RequestBuilder(rootUrl, resetPassword.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context})
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<{}>;
    })
  );
}

resetPassword.PATH = '/auth/reset-password';
