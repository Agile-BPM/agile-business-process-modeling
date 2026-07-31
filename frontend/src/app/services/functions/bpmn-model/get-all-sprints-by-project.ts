import {StrictHttpResponse} from "../../strict-http-response";
import {Observable} from "rxjs";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";
import {SprintDto} from "../../data/sprint-dto";

export function getAllSprintsByProject(http: HttpClient, rootUrl: string, projectId: number, context?: HttpContext): Observable<StrictHttpResponse<SprintDto[]>> {
  const rb = new RequestBuilder(rootUrl, getAllSprintsByProject.PATH, 'get');
  rb.path('projectId', projectId, {});
  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<SprintDto[]>;
      })
    );
}

getAllSprintsByProject.PATH = '/projects/{projectId}/sprints';
