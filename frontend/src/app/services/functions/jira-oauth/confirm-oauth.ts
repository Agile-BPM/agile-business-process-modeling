import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {filter, map} from "rxjs/operators";
import {RequestBuilder} from "../../request-builder";
import {ConfirmRequest} from "../../api/confirm-request";

export interface Confirm$Params {
  body: ConfirmRequest
}

export function confirmOauth(http: HttpClient, rootUrl: string, params: Confirm$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, confirmOauth.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({responseType: 'text', accept: 'text/plain', context})
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<void>;
    })
  );
}

confirmOauth.PATH = '/oauth/complete';
