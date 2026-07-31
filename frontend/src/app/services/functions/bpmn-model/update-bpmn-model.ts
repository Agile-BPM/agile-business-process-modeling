import {BpmnModelDto} from "../../data/bpmn-model-dto";
import { HttpClient, HttpContext, HttpResponse } from "@angular/common/http";
import {StrictHttpResponse} from "../../strict-http-response";
import {Observable} from "rxjs";
import {RequestBuilder} from "../../request-builder";
import {filter, map} from "rxjs/operators";

export interface UpdateBpmnModel$Params {
  'bpmn-model-id': number;
  body: BpmnModelDto;
}

export function updateBpmnModel(http: HttpClient, rootUrl: string, params: UpdateBpmnModel$Params, context?: HttpContext) : Observable<StrictHttpResponse<BpmnModelDto>> {
    const rb = new RequestBuilder(rootUrl, updateBpmnModel.PATH, 'put');
    rb.path('bpmn-model-id', params['bpmn-model-id'], {});
    rb.body(params.body, 'application/json');

    return http.request(
        rb.build({responseType: 'json', accept: 'application/json', context}),
    ).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => {
        return r as StrictHttpResponse<BpmnModelDto>;
        })
    );
}

updateBpmnModel.PATH = '/models/{bpmn-model-id}';
