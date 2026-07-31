import {RequestBuilder} from "../../request-builder";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {SubtaskDto} from "../../data/subtask-dto";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {filter, map} from "rxjs/operators";

export function getJiraSubtaskInformation(http: HttpClient, rootUrl: string, projectKey: string, subtaskId: string, context?: HttpContext): Observable<StrictHttpResponse<SubtaskDto>> {
  const rb = new RequestBuilder(rootUrl, getJiraSubtaskInformation.PATH, "get");
  rb.path('projectKey', projectKey, {});
  rb.path('subtaskId', subtaskId, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<SubtaskDto>;
      })
    );
}

getJiraSubtaskInformation.PATH = "/jira/projects/{projectKey}/subtasks/{subtaskId}";
