import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http"
import {Observable} from "rxjs"
import {StrictHttpResponse} from "../../strict-http-response"
import {UserStoryDto} from "../../data/user-story-dto"
import {RequestBuilder} from "../../request-builder"
import {filter, map} from "rxjs/operators";

export function getAllJiraStoriesForProject(http: HttpClient, rootUrl: string, projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<UserStoryDto[]>> {
  const rb = new RequestBuilder(rootUrl, getAllJiraStoriesForProject.PATH, "get")
  rb.path('projectKey', projectKey, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<UserStoryDto[]>;
      })
    )
}

getAllJiraStoriesForProject.PATH = "/jira/projects/{projectKey}/stories"
