import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";

export function deleteBpmnModel(http: HttpClient, rootUrl: string, id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, deleteBpmnModel.PATH, 'delete');
  rb.path('id', id, {});

  return http.request(
    rb.build({responseType: 'text', accept: 'application/json', context}),
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<void>;
    })
  );
}

deleteBpmnModel.PATH = '/models/{id}';
