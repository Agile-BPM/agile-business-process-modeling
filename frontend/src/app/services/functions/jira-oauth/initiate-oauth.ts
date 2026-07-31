import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {filter, map} from "rxjs/operators";
import {RequestBuilder} from "../../request-builder";
import {InitiateRequest} from "../../api/initiate-request";

export interface Initiate$Params {
  body: InitiateRequest
}

export function initiateOauth(http: HttpClient, rootUrl: string, params: Initiate$Params, context?: HttpContext): Observable<StrictHttpResponse<string>> {
  const rb = new RequestBuilder(rootUrl, initiateOauth.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({responseType: 'text', accept: 'text/plain', context})
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<string>;
    })
  );
}

initiateOauth.PATH = '/oauth/initiate';
