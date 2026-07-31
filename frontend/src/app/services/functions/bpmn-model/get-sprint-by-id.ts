import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";
import {SprintDto} from "../../data/sprint-dto";

export function getSprintById(http: HttpClient, rootUrl: string, id: number, context?: HttpContext): Observable<StrictHttpResponse<SprintDto>> {
  const rb = new RequestBuilder(rootUrl, getSprintById.PATH, 'get');
  rb.path('id', id, {});
  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<SprintDto>;
      })
    );
}

getSprintById.PATH = '/sprints/{id}';
