import type {StrictHttpResponse} from "../../strict-http-response"
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http"
import {filter, map} from "rxjs/operators"
import {RequestBuilder} from "../../request-builder"
import type {Observable} from "rxjs"

export interface ShareProject$Params {
  projectId: number
  email: string
}

export function shareProject(http: HttpClient, rootUrl: string, params: ShareProject$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
  const rb = new RequestBuilder(rootUrl, shareProject.PATH, "post")
  rb.path("projectId", params.projectId, {})
  rb.body(params.email, "application/json")

  return http.request(rb.build({responseType: "json", accept: "application/json", context})).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<number>
    }),
  )
}

shareProject.PATH = "/projects/{projectId}/share"
