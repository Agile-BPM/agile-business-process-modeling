import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {Observable} from "rxjs";
import {StrictHttpResponse} from "../../strict-http-response";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";
import {ProjectDto} from "../../data/project-dto";

export interface LinkProjectToJiraProject$Params {
  projectId: number;
  jiraProjectKey: string;
}

export function linkProjectToJiraProject(http: HttpClient, rootUrl: string, params: LinkProjectToJiraProject$Params, context?: HttpContext): Observable<StrictHttpResponse<ProjectDto>> {
  const rb = new RequestBuilder(rootUrl, linkProjectToJiraProject.PATH, 'post');
  rb.path('id', params.projectId, {});
  rb.body(params.jiraProjectKey, 'application/json');

  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}))
    .pipe(
      filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
      map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<ProjectDto>;
      })
    );
}

linkProjectToJiraProject.PATH = '/projects/{id}/jira-link';
