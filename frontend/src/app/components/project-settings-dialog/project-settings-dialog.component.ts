import {Component, EventEmitter, Input, type OnDestroy, type OnInit, Output} from "@angular/core"
import {NgClass, NgFor, NgIf} from "@angular/common"
import {FormsModule} from "@angular/forms"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {SprintDto} from "../../services/data/sprint-dto"
import {Router} from "@angular/router"
import {ProjectItem, SprintItem} from "../main-layout/main-layout.component"
import {BpmnModelDto} from "../../services/data/bpmn-model-dto"
import {CreateSprint$Params} from "../../services/functions/bpmn-model/create-sprint"
import {JiraProjectDto} from "../../services/data/jira-project-dto"
import {UserDto} from "../../services/data/user-dto"
import {JiraService} from "../../services/jira.service"
import {UserService} from "../../services/user.service"
import {BpmnDiffViewerComponent} from "../bpmn-diff-viewer/bpmn-diff-viewer.component"

// todo: all logic related to project settings should be moved to main layout component

@Component({
    selector: "app-project-settings-dialog",
    imports: [NgIf, NgFor, FormsModule, NgClass, BpmnDiffViewerComponent],
    templateUrl: "./project-settings-dialog.component.html",
    styleUrl: "./project-settings-dialog.component.css"
})
export class ProjectSettingsDialogComponent implements OnInit, OnDestroy {
  @Input() isOpen = false
  @Input() project: ProjectItem | null = null
  @Output() onClose = new EventEmitter<void>()
  @Output() onProjectDeleted = new EventEmitter<number>()
  @Output() onSprintCreated = new EventEmitter<CreateSprint$Params>()
  @Output() onSprintDeleted = new EventEmitter<number>()
  @Output() onModelCreated = new EventEmitter<BpmnModelDto>()
  @Output() onModelDeleted = new EventEmitter<number>()

  sprints: SprintDto[] = []
  isLoadingSprints = false
  isDeletingProject = false
  isDeletingSprint: { [key: number]: boolean } = {}

  // Create sprint form
  newSprintName = ""
  showCreateSprintForm = false
  createSprintError = ""

  // Project sharing
  shareEmail = ""
  isSharingProject = false
  shareProjectError = ""
  shareProjectSuccess = ""

  // Jira integration
  isJiraDropdownOpen = false
  selectedJiraProject: JiraProjectDto | null = null
  jiraLinkSuccess = false
  jiraProjects: JiraProjectDto[] = []
  user: UserDto = {
    firstname: "",
    lastname: "",
    email: "",
    isJiraAuthenticated: false,
  }

  showDiffViewer = false
  currentModel: any = null
  previousModel: any = null

  showVersionSelector: { [key: string]: boolean } = {}
  selectedComparisonVersion: { [key: string]: any } = {}
  isSprintExpanded: { [key: number]: boolean } = {}

  constructor(
    private bpmnModelApiService: BpmnModelApiService,
    private router: Router,
    private jiraService: JiraService,
    private userService: UserService,
  ) {
  }

  ngOnInit(): void {
    this.loadUserInfo()
    this.initializeSprintAccordionState()
    // Close dropdown when clicking outside
    document.addEventListener("click", this.onDocumentClick.bind(this))
  }

  ngOnDestroy(): void {
    document.removeEventListener("click", this.onDocumentClick.bind(this))
  }

  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement
    const dropdown = target.closest(".jira-dropdown-container")
    const versionDropdown = target.closest(".version-selector-container")
    if (!dropdown) {
      this.isJiraDropdownOpen = false
    }
    if (!versionDropdown) {
      this.showVersionSelector = {}
    }
  }

  loadUserInfo(): void {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user
        this.loadJiraProjects()
      },
    })
  }

  loadJiraProjects(): void {
    if (this.user.isJiraAuthenticated) {
      this.jiraService.getAllJiraProjects().subscribe((projects) => {
        this.jiraProjects = projects
      })
    }
  }

  toggleJiraDropdown(): void {
    this.isJiraDropdownOpen = !this.isJiraDropdownOpen
  }

  selectJiraProject(project: JiraProjectDto): void {
    this.selectedJiraProject = project
    this.isJiraDropdownOpen = false

    if (this.project) {
      this.bpmnModelApiService.linkProjectToJiraProject(this.project.id, this.selectedJiraProject.key).subscribe({
        next: (updatedProject) => {
          this.jiraLinkSuccess = true
          if (this.project) {
            this.project.jiraProjectKey = project.key
          }

          setTimeout(() => {
            this.jiraLinkSuccess = false
          }, 3000)
        },
        error: (err) => {
          console.error(`Error linking project to Jira project: ${err.message}`)
          alert(`Error linking project to Jira project: ${err.message}`)
        },
      })
    }
  }

  deleteProject(): void {
    if (this.isDeletingProject || !this.project) return

    const confirmMessage = `Are you sure you want to delete the project "${this.project.name}"? This will delete all sprints and models within this project. This action cannot be undone.`

    if (!confirm(confirmMessage)) {
      return
    }

    this.onProjectDeleted.emit(this.project!.id)
    this.onClose.emit()
  }

  deleteSprint(sprint: SprintItem): void {
    const confirmMessage = `Are you sure you want to delete the sprint "${sprint.name}"? This will delete all models within this sprint. This action cannot be undone.`
    if (!confirm(confirmMessage)) {
      return
    }

    this.onSprintDeleted.emit(sprint.id)
  }

  showCreateForm(): void {
    this.showCreateSprintForm = true
    this.newSprintName = ""
    this.createSprintError = ""
  }

  hideCreateForm(): void {
    this.showCreateSprintForm = false
    this.newSprintName = ""
    this.createSprintError = ""
  }

  validateSprintName(): boolean {
    this.createSprintError = ""

    if (!this.newSprintName.trim()) {
      this.createSprintError = "Sprint name is required"
      return false
    }

    if (this.newSprintName.trim().length < 2) {
      this.createSprintError = "Sprint name must be at least 2 characters"
      return false
    }

    if (this.newSprintName.trim().length > 100) {
      this.createSprintError = "Sprint name must be less than 100 characters"
      return false
    }

    // Check for duplicate names
    if (this.sprints.some((s) => s.name.toLowerCase() === this.newSprintName.trim().toLowerCase())) {
      this.createSprintError = "A sprint with this name already exists"
      return false
    }

    return true
  }

  createSprint(): void {
    if (!this.validateSprintName() || !this.project?.id) {
      return
    }
    this.onSprintCreated.emit({
      name: this.newSprintName.trim(),
      projectId: this.project.id,
      status: "active",
    })
    this.hideCreateForm()
  }

  onSprintNameChange(): void {
    if (this.createSprintError) {
      this.validateSprintName()
    }
  }

  // Project sharing methods
  shareProject(): void {
    if (!this.isValidEmail(this.shareEmail) || this.isSharingProject || !this.project?.id) {
      return
    }

    this.clearShareMessages()
    this.isSharingProject = true

    this.bpmnModelApiService
      .shareProject({
        projectId: this.project.id,
        email: this.shareEmail.trim(),
      })
      .subscribe({
        next: () => {
          this.isSharingProject = false
          this.shareProjectSuccess = `Project successfully shared with ${this.shareEmail}`
          this.shareEmail = ""

          // Clear success message after 5 seconds
          setTimeout(() => {
            this.shareProjectSuccess = ""
          }, 5000)
        },
        error: (err) => {
          this.isSharingProject = false
          console.error("Error sharing project:", err)

          let errorMessage = "Failed to share project. Please try again."
          if (err.error?.message) {
            errorMessage = err.error.message
          } else if (err.status === 404) {
            errorMessage = "User with this email address not found."
          } else if (err.status === 409) {
            errorMessage = "Project is already shared with this user."
          }

          this.shareProjectError = errorMessage
        },
      })
  }

  onShareEmailChange(): void {
    this.clearShareMessages()
  }

  clearShareMessages(): void {
    this.shareProjectError = ""
    this.shareProjectSuccess = ""
  }

  isValidEmail(email: string): boolean {
    if (!email || !email.trim()) {
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  getSprintModels(sprintId: number): any[] {
    if (!this.project) return []

    const sprint = this.project.sprints.find((s) => s.id === sprintId)
    return sprint ? sprint.models : []
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close()
    }
  }

  close(): void {
    this.hideCreateForm()
    this.clearShareMessages()
    this.shareEmail = ""
    this.isJiraDropdownOpen = false
    this.showVersionSelector = {}
    this.selectedComparisonVersion = {}
    this.isSprintExpanded = {}
    this.onClose.emit()
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`
  }

  createNewVersion(sprint: SprintItem): void {
    const sprintModels = this.getSprintModels(sprint.id)
    const latestModel = sprintModels[sprintModels.length - 1]
    const newVersionName = `New Version`

    const newModel = {
      name: newVersionName,
      sprintId: sprint.id,
      bpmnXml: latestModel.xml || ""
    }
    this.onModelCreated.emit(newModel)
  }

  deleteModel(model: any): void {
    const confirmMessage = `Are you sure you want to delete the model "${model.name}"? This action cannot be undone.`
    if (!confirm(confirmMessage)) {
      return
    }
    this.onModelDeleted.emit(model.id)
  }

  openDiffViewer(currentModel: any, previousModel: any): void {
    this.currentModel = currentModel
    this.previousModel = previousModel
    this.showDiffViewer = true
  }

  closeDiffViewer(): void {
    this.showDiffViewer = false
    this.currentModel = null
    this.previousModel = null
  }

  toggleVersionSelector(modelId: string): void {
    // Close all other dropdowns first
    Object.keys(this.showVersionSelector).forEach((key) => {
      if (key !== modelId) {
        this.showVersionSelector[key] = false
      }
    })

    this.showVersionSelector[modelId] = !this.showVersionSelector[modelId]
  }

  selectComparisonVersion(currentModel: any, comparisonModel: any, sprintId: number): void {
    const modelKey = `${sprintId}_${currentModel.id}`
    this.selectedComparisonVersion[modelKey] = comparisonModel
    this.showVersionSelector[modelKey] = false
    this.openDiffViewer(currentModel, comparisonModel)
  }

  getAvailableVersionsInSprint(currentModel: any, sprintId: number): any[] {
    const sprintModels = this.getSprintModels(sprintId)

    // If it's the same sprint, exclude the current model
    if (sprintId === this.getCurrentSprintId(currentModel)) {
      return sprintModels.filter((m) => m.id !== currentModel.id)
    }

    // If it's a different sprint, return all models
    return sprintModels
  }

  hasAvailableVersionsForComparison(currentModel: any): boolean {
    if (!this.project?.sprints) return false

    // Check if there are any versions available across all sprints
    return this.project.sprints.some((sprint) => this.getAvailableVersionsInSprint(currentModel, sprint.id).length > 0)
  }

  getCurrentSprintId(model: any): number {
    if (!this.project?.sprints) return -1

    for (const sprint of this.project.sprints) {
      if (sprint.models.some((m) => m.id === model.id)) {
        return sprint.id
      }
    }
    return -1
  }

  initializeSprintAccordionState(): void {
    if (this.project?.sprints) {
      this.project.sprints.forEach((sprint) => {
        this.isSprintExpanded[sprint.id] = true // All sprints expanded by default
      })
    }
  }

  toggleSprintAccordion(sprintId: number): void {
    this.isSprintExpanded[sprintId] = !this.isSprintExpanded[sprintId]
  }
}
