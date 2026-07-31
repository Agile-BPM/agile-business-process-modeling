import {UserStoryDto} from "../../data/user-story-dto";
import {StrictHttpResponse} from "../../strict-http-response";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {filter, map} from "rxjs/operators";
import {RequestBuilder} from "../../request-builder";

export function getJiraStoryInformation(http: HttpClient, rootUrl: string, projectKey: string, storyId: string, context?: HttpContext) {
  const rb = new RequestBuilder(rootUrl, getJiraStoryInformation.PATH, "get");
  rb.path('projectKey', projectKey, {});
  rb.path('storyId', storyId, {});
  return http.request(
    rb.build({responseType: "json", accept: "application/json", context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<UserStoryDto>;
      })
    );
}

getJiraStoryInformation.PATH = "/jira/projects/{projectKey}/stories/{storyId}";
