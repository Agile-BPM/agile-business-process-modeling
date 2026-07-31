import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http"
import {Observable} from "rxjs"
import {StrictHttpResponse} from "../../strict-http-response"
import {SubtaskDto} from "../../data/subtask-dto"
import {RequestBuilder} from "../../request-builder"
import {filter, map} from "rxjs/operators";

export function getAllJiraSubtasksForProject(http: HttpClient, rootUrl: string, projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<SubtaskDto[]>> {
  const rb = new RequestBuilder(rootUrl, getAllJiraSubtasksForProject.PATH, "get")
  rb.path('projectKey', projectKey, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<SubtaskDto[]>;
      })
    )
}

getAllJiraSubtasksForProject.PATH = "/jira/projects/{projectKey}/subtasks"
