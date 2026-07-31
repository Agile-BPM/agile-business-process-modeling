import {StrictHttpResponse} from "../../strict-http-response";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {filter, map} from "rxjs/operators";
import {RequestBuilder} from "../../request-builder";
import {Observable} from "rxjs";

export interface ShareBpmnModel$Params {
    modelId: number;
  email: string;
}

export function shareBpmnModel(http: HttpClient, rootUrl: string, params: ShareBpmnModel$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
  const rb = new RequestBuilder(rootUrl, shareBpmnModel.PATH, 'post');
  rb.path('id', params.modelId, {});
  rb.body(params.email, 'application/json');

  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<number>;
      })
    );
}

shareBpmnModel.PATH = '/models/{id}/share';
