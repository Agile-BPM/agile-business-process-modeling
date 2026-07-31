import {Injectable} from "@angular/core"
import {type Observable} from "rxjs"
import { HttpClient, HttpContext } from "@angular/common/http";
import {map} from "rxjs/operators";
import {ApiConfiguration} from "../api-configuration";
import {BaseService} from "../base-service";
import {StrictHttpResponse} from "../strict-http-response";
import {BpmnModelDto} from "../data/bpmn-model-dto";
import {createBpmnModel, CreateBpmnModel$Params} from "../functions/bpmn-model/create-bpmn-model";
import {updateBpmnModel, UpdateBpmnModel$Params} from "../functions/bpmn-model/update-bpmn-model";
import {getAllBpmnModels} from "../functions/bpmn-model/get-all-bpmn-models";
import {getBpmnModelById} from "../functions/bpmn-model/get-bpmn-model-by-id";
import {deleteBpmnModel} from "../functions/bpmn-model/delete-bpmn-model";
import {shareBpmnModel, ShareBpmnModel$Params} from "../functions/bpmn-model/share-bpmn-model";
import {getModelStatus, GetModelStatusResponse} from "../functions/bpmn-model/get-model-status";
import {ProjectDto} from "../data/project-dto";
import {getAllProjects} from "../functions/bpmn-model/get-all-projects";
import {SprintDto} from "../data/sprint-dto";
import {getAllSprintsByProject} from "../functions/bpmn-model/get-all-sprints-by-project";
import {getAllBpmnModelsBySprint} from "../functions/bpmn-model/get-all-bpmn-models-by-sprint";
import {createProject, CreateProject$Params} from "../functions/bpmn-model/create-project";
import {createSprint, CreateSprint$Params} from "../functions/bpmn-model/create-sprint";
import {deleteProject} from "../functions/bpmn-model/delete-project";
import {deleteSprint} from "../functions/bpmn-model/delete-sprint";
import {shareProject, ShareProject$Params} from "../functions/bpmn-model/share-project";
import {getSprintById} from "../functions/bpmn-model/get-sprint-by-id";
import {linkProjectToJiraProject} from "../functions/bpmn-model/link-project-to-jira-project";

@Injectable({
  providedIn: "root",
})
export class BpmnModelApiService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  getAllBpmnModels$Response(context?: HttpContext): Observable<StrictHttpResponse<BpmnModelDto[]>> {
    return getAllBpmnModels(this.http, this.rootUrl, context);
  }

  getAllBpmnModels(context?: HttpContext): Observable<BpmnModelDto[]> {
    return this.getAllBpmnModels$Response(context).pipe(
      map((r: StrictHttpResponse<BpmnModelDto[]>): BpmnModelDto[] => r.body)
    );
  }

  getBpmnModelById$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<BpmnModelDto>> {
    return getBpmnModelById(this.http, this.rootUrl, id, context)
  }

  getBpmnModelById(id: number, context?: HttpContext): Observable<BpmnModelDto> {
    return this.getBpmnModelById$Response(id, context).pipe(
      map((r: StrictHttpResponse<BpmnModelDto>): BpmnModelDto => r.body)
    );
  }

  createBpmnModel$Response(params: CreateBpmnModel$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
    return createBpmnModel(this.http, this.rootUrl, params, context);
  }

  createBpmnModel(params: CreateBpmnModel$Params, context?: HttpContext): Observable<number> {
    return this.createBpmnModel$Response(params, context).pipe(
      map((r: StrictHttpResponse<number>): number => r.body)
    );
  }

  updateBpmnModel$Response(params: UpdateBpmnModel$Params, context?: HttpContext): Observable<StrictHttpResponse<BpmnModelDto>> {
    return updateBpmnModel(this.http, this.rootUrl, params, context);
  }

  updateBpmnModel(params: UpdateBpmnModel$Params, context?: HttpContext): Observable<BpmnModelDto> {
    return this.updateBpmnModel$Response(params, context).pipe(
      map((r: StrictHttpResponse<BpmnModelDto>): BpmnModelDto => r.body)
    );
  }

  deleteBpmnModelById$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteBpmnModel(this.http, this.rootUrl, id, context);
  }

  deleteBpmnModelById(id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return this.deleteBpmnModelById$Response(id, context).pipe(
      map((r: StrictHttpResponse<void>): StrictHttpResponse<void> => r)
    );
  }

  shareBpmnModel$Response(params: ShareBpmnModel$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
    return shareBpmnModel(this.http, this.rootUrl, params, context);
  }

  shareBpmnModel(params: ShareBpmnModel$Params, context?: HttpContext): Observable<number> {
    return this.shareBpmnModel$Response(params, context).pipe(
      map((r: StrictHttpResponse<number>): number => r.body)
    );
  }

  getModelStatus$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<GetModelStatusResponse>> {
    return getModelStatus(this.http, this.rootUrl, id, context);
  }

  getModelStatus(id: number, context?: HttpContext): Observable<GetModelStatusResponse> {
    return this.getModelStatus$Response(id, context).pipe(
      map((r: StrictHttpResponse<GetModelStatusResponse>): GetModelStatusResponse => r.body)
    );
  }

  getAllProjects$Response(context?: HttpContext): Observable<StrictHttpResponse<ProjectDto[]>> {
    return getAllProjects(this.http, this.rootUrl, context);
  }

  getAllProjects(context?: HttpContext): Observable<ProjectDto[]> {
    return this.getAllProjects$Response(context).pipe(
      map((r: StrictHttpResponse<ProjectDto[]>): ProjectDto[] => r.body)
    );
  }

  getAllSprintsByProject$Response(projectId: number, context?: HttpContext): Observable<StrictHttpResponse<SprintDto[]>> {
    return getAllSprintsByProject(this.http, this.rootUrl, projectId, context);
  }

  getAllSprintsByProject(projectId: number, context?: HttpContext): Observable<SprintDto[]> {
    return this.getAllSprintsByProject$Response(projectId, context).pipe(
      map((r: StrictHttpResponse<SprintDto[]>): SprintDto[] => r.body)
    );
  }

  getSprintById$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<SprintDto>> {
    return getSprintById(this.http, this.rootUrl, id, context);
  }

  getSprintById(id: number, context?: HttpContext): Observable<SprintDto> {
    return this.getSprintById$Response(id, context).pipe(
      map((r: StrictHttpResponse<SprintDto>): SprintDto => r.body)
    );
  }

  getAllBpmnModelsBySprint$Response(sprintId: number, context?: HttpContext): Observable<StrictHttpResponse<BpmnModelDto[]>> {
    return getAllBpmnModelsBySprint(this.http, this.rootUrl, sprintId, context);
  }

  getAllBpmnModelsBySprint(sprintId: number, context?: HttpContext): Observable<BpmnModelDto[]> {
    return this.getAllBpmnModelsBySprint$Response(sprintId, context).pipe(
      map((r: StrictHttpResponse<BpmnModelDto[]>): BpmnModelDto[] => r.body)
    );
  }

  createProject$Response(createProjectParams: CreateProject$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
    return createProject(this.http, this.rootUrl, createProjectParams, context);
  }

  createProject(createProjectParams: CreateProject$Params, context?: HttpContext): Observable<number> {
    return this.createProject$Response(createProjectParams, context).pipe(
      map((r: StrictHttpResponse<number>): number => r.body)
    );
  }

  createSprint$Response(createSprintParams: CreateSprint$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
    return createSprint(this.http, this.rootUrl, createSprintParams, context);
  }

  createSprint(createSprintParams: CreateSprint$Params, context?: HttpContext): Observable<number> {
    return this.createSprint$Response(createSprintParams, context).pipe(
      map((r: StrictHttpResponse<number>): number => r.body)
    );
  }

  deleteProject$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteProject(this.http, this.rootUrl, id, context)
  }

  deleteProject(id: number, context?: HttpContext): Observable<void> {
    return this.deleteProject$Response(id, context).pipe(map((r: StrictHttpResponse<void>): void => r.body))
  }

  deleteSprint$Response(id: number, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteSprint(this.http, this.rootUrl, id, context)
  }

  deleteSprint(id: number, context?: HttpContext): Observable<void> {
    return this.deleteSprint$Response(id, context).pipe(map((r: StrictHttpResponse<void>): void => r.body))
  }

  shareProject$Response(params: ShareProject$Params, context?: HttpContext): Observable<StrictHttpResponse<number>> {
    return shareProject(this.http, this.rootUrl, params, context)
  }

  shareProject(params: ShareProject$Params, context?: HttpContext): Observable<number> {
    return this.shareProject$Response(params, context).pipe(map((r: StrictHttpResponse<number>): number => r.body))
  }

  linkProjectToJiraProject$Response(projectId: number, jiraProjectKey: string, context?: HttpContext): Observable<StrictHttpResponse<ProjectDto>> {
    return linkProjectToJiraProject(this.http, this.rootUrl, {projectId, jiraProjectKey}, context);
  }

  linkProjectToJiraProject(projectId: number, jiraProjectKey: string, context?: HttpContext): Observable<ProjectDto> {
    return this.linkProjectToJiraProject$Response(projectId, jiraProjectKey, context).pipe(
      map((r: StrictHttpResponse<ProjectDto>): ProjectDto => r.body)
    );
  }

}
