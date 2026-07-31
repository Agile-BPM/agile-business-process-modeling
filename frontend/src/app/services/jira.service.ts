import {Injectable} from '@angular/core';
import {BaseService} from "./base-service";
import {ApiConfiguration} from "./api-configuration";
import { HttpClient, HttpContext } from "@angular/common/http";
import {StrictHttpResponse} from "./strict-http-response";
import {Observable} from "rxjs";
import {JiraProjectDto} from "./data/jira-project-dto";
import {getAllJiraProjects} from "./functions/jira/get-all-projects";
import {map} from "rxjs/operators";
import {getAllJiraEpicsForProject} from "./functions/jira/get-all-jira-epics";
import {EpicDto} from "./data/epic-dto";
import {getAllJiraStoriesForProject} from "./functions/jira/get-all-jira-stories";
import {UserStoryDto} from "./data/user-story-dto";
import {getAllJiraSubtasksForProject} from "./functions/jira/get-all-jira-subtasks";
import {SubtaskDto} from "./data/subtask-dto";
import {getJiraEpicInformation} from "./functions/jira/get-jira-epic-information";
import {getJiraStoryInformation} from "./functions/jira/get-jira-story-information";
import {getJiraSubtaskInformation} from "./functions/jira/get-jira-subtask-information";

@Injectable({
  providedIn: 'root'
})
export class JiraService extends BaseService {

  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  getAllJiraProjects$Response(context?: HttpContext): Observable<StrictHttpResponse<JiraProjectDto[]>> {
    return getAllJiraProjects(this.http, this.rootUrl, context);
  }

  getAllJiraProjects(context?: HttpContext): Observable<JiraProjectDto[]> {
    return this.getAllJiraProjects$Response(context).pipe(
      map((r: StrictHttpResponse<JiraProjectDto[]>): JiraProjectDto[] => r.body)
    );
  }

  getAllJiraEpics$Response(projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<EpicDto[]>> {
    return getAllJiraEpicsForProject(this.http, this.rootUrl, projectKey, context);
  }

  getAllJiraEpics(projectKey: string, context?: HttpContext): Observable<EpicDto[]> {
    return this.getAllJiraEpics$Response(projectKey, context).pipe(
      map((r: StrictHttpResponse<EpicDto[]>): EpicDto[] => r.body)
    );
  }

  getJiraEpicInformation$Response(projectKey: string, epicId: string, context?: HttpContext): Observable<StrictHttpResponse<EpicDto>> {
    return getJiraEpicInformation(this.http, this.rootUrl, projectKey, epicId, context);
  }

  getJiraEpicInformation(projectKey: string, epicId: string, context?: HttpContext): Observable<EpicDto> {
    return this.getJiraEpicInformation$Response(projectKey, epicId, context).pipe(
      map((r: StrictHttpResponse<EpicDto>): EpicDto => r.body)
    );
  }

  getAllJiraStories$Response(projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<UserStoryDto[]>> {
    return getAllJiraStoriesForProject(this.http, this.rootUrl, projectKey, context);
  }

  getAllJiraStories(projectKey: string, context?: HttpContext): Observable<UserStoryDto[]> {
    return this.getAllJiraStories$Response(projectKey, context).pipe(
      map((r: StrictHttpResponse<UserStoryDto[]>): UserStoryDto[] => r.body)
    );
  }

  getJiraStoryInformation$Response(projectKey: string, storyId: string, context?: HttpContext): Observable<StrictHttpResponse<UserStoryDto>> {
    return getJiraStoryInformation(this.http, this.rootUrl, projectKey, storyId, context);
  }

  getJiraStoryInformation(projectKey: string, storyId: string, context?: HttpContext): Observable<UserStoryDto> {
    return this.getJiraStoryInformation$Response(projectKey, storyId, context).pipe(
      map((r: StrictHttpResponse<UserStoryDto>): UserStoryDto => r.body)
    );
  }

  getAllJiraSubtasks$Response(projectKey: string, context?: HttpContext): Observable<StrictHttpResponse<SubtaskDto[]>> {
    return getAllJiraSubtasksForProject(this.http, this.rootUrl, projectKey, context);
  }

  getAllJiraSubtasks(projectKey: string, context?: HttpContext): Observable<SubtaskDto[]> {
    return this.getAllJiraSubtasks$Response(projectKey, context).pipe(
      map((r: StrictHttpResponse<SubtaskDto[]>): SubtaskDto[] => r.body)
    );
  }

  getJiraSubtaskInformation$Response(projectKey: string, subtaskId: string, context?: HttpContext): Observable<StrictHttpResponse<SubtaskDto>> {
    return getJiraSubtaskInformation(this.http, this.rootUrl, projectKey, subtaskId, context);
  }

  getJiraSubtaskInformation(projectKey: string, subtaskId: string, context?: HttpContext): Observable<SubtaskDto> {
    return this.getJiraSubtaskInformation$Response(projectKey, subtaskId, context).pipe(
      map((r: StrictHttpResponse<SubtaskDto>): SubtaskDto => r.body)
    );
  }

}
