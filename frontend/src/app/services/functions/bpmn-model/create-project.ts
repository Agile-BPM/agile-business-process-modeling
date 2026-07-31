import {StrictHttpResponse} from "../../strict-http-response";
import {Observable} from "rxjs";
import {RequestBuilder} from "../../request-builder";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {filter, map} from "rxjs/operators";

export interface CreateProject$Params {
  name: string;
  description?: string;
  initialBpmnXml?: string;
  jiraProjectKey?: string;
}

export function createProject(http: HttpClient, rootUrl: string, params: CreateProject$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
  const rb = new RequestBuilder(rootUrl, createProject.PATH, 'post');
  rb.body(params, 'application/json');
  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}),
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<number>;
    })
  );
}

createProject.PATH = '/projects';
