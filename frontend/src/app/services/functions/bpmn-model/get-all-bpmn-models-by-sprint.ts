import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {BpmnModelDto} from "../../data/bpmn-model-dto";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";

export function getAllBpmnModelsBySprint(http: HttpClient, rootUrl: string, sprintId: number, context?: HttpContext): Observable<StrictHttpResponse<BpmnModelDto[]>> {
  const rb = new RequestBuilder(rootUrl, getAllBpmnModelsBySprint.PATH, 'get');
  rb.path('sprintId', sprintId, {});
  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<BpmnModelDto[]>;
      })
    );
}

getAllBpmnModelsBySprint.PATH = '/sprints/{sprintId}/models';
