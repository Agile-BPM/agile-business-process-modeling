import {Component, ElementRef, EventEmitter, Input, type OnDestroy, type OnInit, Output} from "@angular/core"
import {NgClass, NgForOf, NgIf} from "@angular/common"
import {Router} from "@angular/router"
import type {UserDto} from "../../services/data/user-dto"
import {
  CreateProjectDialogComponent,
  type NewProjectData,
} from "../create-project-dialog/create-project-dialog.component"
import type {ModelItem, ProjectItem, SprintItem} from "../main-layout/main-layout.component"

@Component({
    selector: "app-sidebar",
    imports: [NgIf, NgForOf, NgClass, CreateProjectDialogComponent],
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.css"
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() user: UserDto = {
    firstname: "",
    lastname: "",
    email: "",
    isJiraAuthenticated: false,
  }
  @Input() projects: ProjectItem[] = []

  @Output() modelSelected = new EventEmitter<number>()
  @Output() projectCreated = new EventEmitter<NewProjectData>()

  isUserMenuOpen = false
  private clickListener: any = null

  // New Project Dialog
  isNewProjectDialogOpen = false

  constructor(
    private router: Router,
    private elementRef: ElementRef,
  ) {
  }

  ngOnInit() {
    this.clickListener = (event: MouseEvent) => {
      if (!this.elementRef.nativeElement.querySelector(".user-section")?.contains(event.target)) {
        this.isUserMenuOpen = false
      }
    }
    document.addEventListener("click", this.clickListener)
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener)
    }
  }

  selectModel(model: ModelItem): void {
    this.modelSelected.emit(model.id)
  }

  toggleProject(project: ProjectItem): void {
    project.isExpanded = !project.isExpanded
  }

  toggleSprint(sprint: SprintItem): void {
    sprint.isExpanded = !sprint.isExpanded
  }

  getStatusClass(status: string): string {
    return `status-${status}`
  }

  openNewProjectDialog(): void {
    this.isNewProjectDialogOpen = true
  }

  onNewProjectDialogClose(): void {
    this.isNewProjectDialogOpen = false
  }

  onCreateProject(projectData: NewProjectData): void {
    this.projectCreated.emit(projectData)
    this.isNewProjectDialogOpen = false
  }

  onOpenSettings(): void {
    this.isNewProjectDialogOpen = false
    this.router.navigate(["/profile"], {queryParams: {tab: "integrations"}})
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation()
    this.isUserMenuOpen = !this.isUserMenuOpen
  }

  viewProfile(event: Event): void {
    event.stopPropagation()
    this.isUserMenuOpen = false
    this.router.navigate(["/profile"])
  }

  logout(event: Event): void {
    event.stopPropagation()
    localStorage.removeItem("selectedModelId")
    localStorage.removeItem("token")
    window.location.reload()
  }
}
