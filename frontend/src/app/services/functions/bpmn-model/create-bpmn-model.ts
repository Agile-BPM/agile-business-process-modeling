import {BpmnModelDto} from "../../data/bpmn-model-dto";
import {StrictHttpResponse} from "../../strict-http-response";
import {Observable} from "rxjs";
import {RequestBuilder} from "../../request-builder";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {filter, map} from "rxjs/operators";

export interface CreateBpmnModel$Params {
  body: BpmnModelDto
}

export function createBpmnModel(http: HttpClient, rootUrl: string, params: CreateBpmnModel$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
  const rb = new RequestBuilder(rootUrl, createBpmnModel.PATH, 'post');
  rb.body(params.body, 'application/json');

  return http.request(
    rb.build({responseType: 'json', accept: 'application/json', context}),
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<number>;
    })
  );
}

createBpmnModel.PATH = '/models';
