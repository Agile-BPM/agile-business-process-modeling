import {Component, type OnDestroy, type OnInit} from "@angular/core"
import {SidebarComponent} from "../sidebar/sidebar.component"
import {HeaderComponent} from "../header/header.component"
import {BpmnViewerComponent} from "../bpmn-viewer/bpmn-viewer.component"
import {NgIf} from "@angular/common"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {UserService} from "../../services/user.service"
import type {Subscription} from "rxjs"
import type {UserDto} from "../../services/data/user-dto"
import type {BpmnModelDto} from "../../services/data/bpmn-model-dto"
import {
  CreateProjectDialogComponent,
  type NewProjectData
} from "../create-project-dialog/create-project-dialog.component";
import {Router} from "@angular/router";
import {ProjectSettingsDialogComponent} from "../project-settings-dialog/project-settings-dialog.component";
import {InitalBpmnModelProviderService} from "../../services/inital-bpmn-model-provider.service";
import {CreateSprint$Params} from "../../services/functions/bpmn-model/create-sprint";

export interface ModelItem {
  id: number
  sprintId?: number
  name: string
  isSelected: boolean
  xml?: string
}

export interface SprintItem {
  id: number
  name: string
  status: string
  models: ModelItem[]
  isExpanded: boolean
}

export interface ProjectItem {
  id: number
  name: string
  description?: string
  sprints: SprintItem[]
  jiraProjectKey?: string
  isExpanded: boolean
}

@Component({
    selector: "app-main-layout",
    imports: [
        SidebarComponent,
        HeaderComponent,
        BpmnViewerComponent,
        NgIf,
        CreateProjectDialogComponent,
        ProjectSettingsDialogComponent,
    ],
    templateUrl: "./main-layout.component.html",
    styleUrl: "./main-layout.component.css"
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // User data
  user: UserDto = {
    firstname: "",
    lastname: "",
    email: "",
    isJiraAuthenticated: false,
  }

  // Projects data
  projects: ProjectItem[] = []

  // Selected model data
  selectedModelId = 0
  selectedModel: ModelItem | null = null
  selectedSprint: SprintItem | null = null
  currentProject: ProjectItem | null = null
  currentSprintId = 0
  currentSprintName = ""

  isModelFullyLoaded = false

  isNewProjectDialogOpen = false

  showProjectSettings = false

  private subscriptions: Subscription[] = []

  constructor(
    private bpmnModelApiService: BpmnModelApiService,
    private userService: UserService,
    private router: Router,
    private initialBpmnModelProvider: InitalBpmnModelProviderService,
  ) {
  }

  async ngOnInit() {
    await this.loadUserInfo()
    await this.loadProjects()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  async loadUserInfo(): Promise<void> {
    try {
      this.user = await this.userService.getUser().toPromise()
    } catch (error) {
      console.error("Error loading user info:", error)
    }
  }

  async loadProjects(): Promise<void> {
    try {
      const projectsFromApi = await this.bpmnModelApiService.getAllProjects().toPromise()
      this.projects = []
      for (const p of projectsFromApi) {
        const project: ProjectItem = {
          id: p.id,
          name: p.name,
          description: p.description,
          sprints: [],
          jiraProjectKey: p.jiraProjectKey,
          isExpanded: false,
        }

        const sprintsFromApi = await this.bpmnModelApiService.getAllSprintsByProject(project.id).toPromise()
        for (const s of sprintsFromApi) {
          const sprint: SprintItem = {
            id: s.id,
            name: s.name,
            status: s.status,
            models: [],
            isExpanded: false,
          }

          const modelsFromApi = await this.bpmnModelApiService.getAllBpmnModelsBySprint(sprint.id).toPromise()

          sprint.models = modelsFromApi.map((model) => ({
            id: model.id,
            sprintId: model.sprintId,
            name: model.name,
            isSelected: model.id === this.selectedModelId,
            xml: model.bpmnXml,
          }))

          // Handle initial model selection
          if (this.selectedModelId === 0 && sprint.models.length > 0) {
            const storedId = localStorage.getItem("selectedModelId")
            if (storedId && sprint.models.some((m) => m.id === +storedId)) {
              this.selectedSprint = sprint
              this.currentProject = project
              this.selectedModelId = +storedId
            }
          }
          project.sprints.push(sprint)
        }
        this.projects.push(project)
      }
      this.updateActiveState()
      await this.loadSelectedModel()
    } catch (error) {
      console.error("Error loading projects, sprints or models:", error)
    }
  }

  async loadSelectedModel(): Promise<void> {
    if (!this.selectedModelId) {
      this.setEmptyState()
      return
    }

    this.selectedModel = this.selectedSprint.models.find((m) => m.id === this.selectedModelId) || null
  }

  async onModelSelected(modelId: number): Promise<void> {
    this.isModelFullyLoaded = this.selectedModelId == modelId
    this.selectedModelId = modelId

    // Update active state in projects structure
    this.updateActiveState()

    localStorage.setItem("selectedModelId", String(this.selectedModelId))
    await this.loadSelectedModel()
  }

  updateActiveState(): void {
    for (const project of this.projects) {
      for (const sprint of project.sprints) {
        for (const model of sprint.models) {
          model.isSelected = model.id === this.selectedModelId
          if (model.isSelected) {
            this.selectedSprint = sprint
            this.currentProject = project
            sprint.isExpanded = true
            project.isExpanded = true
          }
        }
      }
    }
  }

  onProjectCreated(projectData: any): void {
    let bpmnXml: string

    if (projectData.importedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        bpmnXml = e.target?.result as string
        this.createProject(projectData.name, "", bpmnXml)
      }
      reader.readAsText(projectData.importedFile)
    } else {
      bpmnXml = this.getInitialProjectModelXml()
      this.createProject(projectData.name, "", bpmnXml)
    }
  }

  private createProject(name: string, description: string, initialBpmnXml: string): void {
    const sub = this.bpmnModelApiService
      .createProject({
        name: name,
        description: description,
        initialBpmnXml: initialBpmnXml,
      })
      .subscribe({
        next: async (projectId) => {
          await this.loadProjects()
          const project = this.projects.find((p) => p.id === projectId)
          const activeSprint = this.getActiveSprintForProject(project.id)
          const latestVersion = this.getLatestVersionOfSprint(activeSprint)
          await this.onModelSelected(latestVersion.id)
        },
        error: (error) => {
          console.error("Error creating project:", error)
        },
      })

    this.subscriptions.push(sub)
  }

  setEmptyState(): void {
    localStorage.removeItem("selectedModelId")
    this.selectedModel = null
    this.currentProject = null
  }

  protected isEmptyState(): boolean {
    const storedId = localStorage.getItem("selectedModelId")
    return !storedId && !this.selectedModel
  }

  openNewProjectDialog(): void {
    this.isNewProjectDialogOpen = true
  }

  onOpenSettings(): void {
    this.isNewProjectDialogOpen = false
    this.router.navigate(["/profile"], {queryParams: {tab: "integrations"}})
  }

  onNewProjectDialogClose(): void {
    this.isNewProjectDialogOpen = false
  }

  onCreateProject(projectData: NewProjectData): void {
    this.onProjectCreated(projectData)
    this.isNewProjectDialogOpen = false
  }

  onModelLoaded() {
    console.log("Model loaded")
    this.isModelFullyLoaded = true
  }

  async handleProjectDeleted(projectId: number): Promise<void> {
    this.bpmnModelApiService.deleteProject(projectId).subscribe(
      {
        next: async () => {
          this.projects = this.projects.filter((p) => p.id !== projectId)
          this.setEmptyState()
          // await this.loadProjects()
        },
        error: (error) => {
          console.error("Error deleting project:", error)
        }
      }
    )
    // this.setEmptyState()
    // await this.loadProjects()
  }

  async handleSprintCreated(createSprintRequest: CreateSprint$Params): Promise<void> {
    this.bpmnModelApiService.createSprint(createSprintRequest).subscribe(
      {
        next: async (sprintId) => {
          const models = await this.bpmnModelApiService.getAllBpmnModelsBySprint(sprintId).toPromise()
          const modelItems = models.map((model) => this.mapModelDtoToModelItem(model))
          const newSprint: SprintItem = {
            id: sprintId,
            name: createSprintRequest.name,
            status: createSprintRequest.status,
            models: modelItems,
            isExpanded: true,
          }
          const project = this.projects.find((p) => p.id === createSprintRequest.projectId)
          const latestSprint = project?.sprints[project.sprints.length - 1]
          latestSprint.status = 'completed'
          project.sprints.push(newSprint)
          await this.onModelSelected(modelItems[0].id)
        },
        error: (error) => {
          console.error("Error creating sprint:", error)
        }
      }
    )
  }

  findProjectForSprint(sprintId: number): ProjectItem | undefined {
    return this.projects.find((p) => p.sprints.some((s) => s.id === sprintId))
  }

  async handleSprintDeleted(sprintId: number): Promise<void> {
    this.bpmnModelApiService.deleteSprint(sprintId).subscribe(
      {
        next: async () => {
          const deletedSprint = this.findSprintById(sprintId)
          const project = this.findProjectForSprint(sprintId)
          if (project) {
            project.sprints = project.sprints.filter((s) => s.id !== sprintId)
            if (deletedSprint.models.some((m) => m.id == this.selectedModelId)) {
              const latestSprint = project.sprints[project.sprints.length - 1]
              this.selectedModelId = latestSprint.models[latestSprint.models.length - 1].id
              await this.onModelSelected(this.selectedModelId)
            }
          }
        }
      }
    )
  }

  mapModelDtoToModelItem(model: BpmnModelDto): ModelItem {
    return {
      id: model.id,
      sprintId: model.sprintId,
      name: model.name,
      isSelected: model.id === this.selectedModelId,
      xml: model.bpmnXml,
    }
  }

  async handleModelCreated(model: BpmnModelDto): Promise<void> {
    this.bpmnModelApiService.createBpmnModel({body: model}).subscribe(
      {
        next: async (modelId) => {
          this.selectedModelId = modelId
          localStorage.setItem("selectedModelId", String(modelId))
          const newModel: ModelItem = {
            id: modelId,
            sprintId: model.sprintId,
            name: model.name,
            isSelected: modelId === this.selectedModelId,
            xml: model.bpmnXml,
          }
          const sprint = this.findSprintById(model.sprintId)
          sprint.models.push(newModel)
          await this.onModelSelected(this.selectedModelId)
        }
      }
    )
  }

  findSprintById(sprintId: number): SprintItem {
    for (const project of this.projects) {
      const sprint = project.sprints.find((s) => s.id === sprintId)
      if (sprint) {
        return sprint
      }
    }
  }

  async handleModelDeleted(modelId: number): Promise<void> {
    this.bpmnModelApiService.deleteBpmnModelById(modelId).subscribe(
      {
        next: () => {
          const sprint = this.findSprintOfModel(modelId)
          if (sprint) {
            sprint.models = sprint.models.filter((m) => m.id !== modelId)
          }
          if (this.selectedModelId === modelId) {
            this.selectedModelId = sprint.models[sprint.models.length - 1]?.id || 0
            this.onModelSelected(this.selectedModelId)
          }
        }
      }
    )
  }

  findSprintOfModel(modelId: number): SprintItem | undefined {
    for (const project of this.projects) {
      for (const sprint of project.sprints) {
        if (sprint.models.some((m) => m.id === modelId)) {
          return sprint
        }
      }
    }
    return undefined
  }

  removeModelById(modelId: number): void {
    for (const project of this.projects) {
      for (const sprint of project.sprints) {
        sprint.models = sprint.models.filter((m) => m.id !== modelId)
      }
    }
  }

  getActiveSprintForProject(projectId: number): SprintItem | undefined {
    const project = this.projects.find((p) => p.id === projectId)
    return project?.sprints.find((s) => s.status == "active")
  }

  getLatestVersionOfSprint(sprint: SprintItem): ModelItem | undefined {
    return sprint.models[sprint.models.length - 1]
  }

  openProjectSettings(): void {
    this.showProjectSettings = true
  }

  closeProjectSettings(): void {
    this.showProjectSettings = false
  }

  private getInitialProjectModelXml(): string {
    return this.initialBpmnModelProvider.getInitialProjectModelXml()
  }
}
