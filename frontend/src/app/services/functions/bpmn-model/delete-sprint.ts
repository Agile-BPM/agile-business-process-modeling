import { type HttpClient, type HttpContext, HttpResponse } from "@angular/common/http"
import type {Observable} from "rxjs"
import type {StrictHttpResponse} from "../../strict-http-response"
import {RequestBuilder} from "../../request-builder"
import {filter, map} from "rxjs/operators"

export function deleteSprint(http: HttpClient, rootUrl: string, id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
  const rb = new RequestBuilder(rootUrl, deleteSprint.PATH, "delete")
  rb.path("id", id, {})

  return http.request(rb.build({responseType: "text", accept: "application/json", context})).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<void>
    }),
  )
}

deleteSprint.PATH = "/sprints/{id}"
