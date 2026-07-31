import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http"
import {Observable} from "rxjs"
import {StrictHttpResponse} from "../../strict-http-response"
import {EpicDto} from "../../data/epic-dto"
import {RequestBuilder} from "../../request-builder"
import {filter, map} from "rxjs/operators";

export function getAllJiraEpicsForProject(http: HttpClient, rootUrl: string, projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<EpicDto[]>> {
  const rb = new RequestBuilder(rootUrl, getAllJiraEpicsForProject.PATH, "get")
  rb.path('projectKey', projectKey, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<EpicDto[]>;
      })
    );
}

getAllJiraEpicsForProject.PATH = "/jira/projects/{projectKey}/epics"
