import {RequestBuilder} from "../../request-builder";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {filter, map} from "rxjs/operators";
import {StrictHttpResponse} from "../../strict-http-response";
import {EpicDto} from "../../data/epic-dto";
import {Observable} from "rxjs";

export function getJiraEpicInformation(http: HttpClient, rootUrl: string, projectKey: string, epicId: string, context?: HttpContext): Observable<StrictHttpResponse<EpicDto>> {
  const rb = new RequestBuilder(rootUrl, getJiraEpicInformation.PATH, "get");
  rb.path('projectKey', projectKey, {});
  rb.path('epicId', epicId, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<EpicDto>;
      })
    );

}

getJiraEpicInformation.PATH = "/jira/projects/{projectKey}/epics/{epicId}";
