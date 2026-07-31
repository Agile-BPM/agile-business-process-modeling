import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  ViewChild,
} from "@angular/core"
import {NgIf} from "@angular/common"
import {Router} from "@angular/router"
import {CustomElementsService} from "../../services/custom-elements.service"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {Subscription} from "rxjs"
import CustomRenderer from "../../custom-modeler/custom-renderer"
import {CustomPropertiesPanelComponent} from "../custom-properties-panel/custom-properties-panel.component"

import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll"
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas"
import {JiraService} from "../../services/jira.service"
import type {EpicDto} from "../../services/data/epic-dto"
import type {UserStoryDto} from "../../services/data/user-story-dto"
import type {SubtaskDto} from "../../services/data/subtask-dto"
import BpmnModeler from "bpmn-js/lib/Modeler"
import {ModelItem, ProjectItem, SprintItem} from "../main-layout/main-layout.component";
import {getStatusCategoryForStatus, normalizeStatusCategory} from "../../services/models/status-category"

@Component({
    selector: "app-bpmn-viewer",
    imports: [NgIf, CustomPropertiesPanelComponent],
    templateUrl: "./bpmn-viewer.component.html",
    styleUrl: "./bpmn-viewer.component.css"
})
export class BpmnViewerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild("bpmnContainer") bpmnContainer!: ElementRef
  @ViewChild("propertiesPanel") propertiesPanel!: ElementRef

  @Input() selectedProject: ProjectItem | null = null
  @Input() selectedModel: ModelItem | null = null
  @Input() selectedSprint: SprintItem | null = null
  @Output() onModelFullyLoaded = new EventEmitter<void>()

  protected bpmnModeler: any // Keep the same name for compatibility with custom properties panel
  private subscriptions: Subscription[] = []

  loading = true
  error: string | null = null

  selectedElement: any = null
  selectedElementObj: any = null

  isLoadingJiraData = false
  jiraDataProgress = 0
  totalJiraElements = 0
  processedJiraElements = 0

  constructor(
    private router: Router,
    private bpmnModelApiService: BpmnModelApiService,
    private customElementsService: CustomElementsService,
    private changeDetectorRef: ChangeDetectorRef,
    private jiraService: JiraService,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initBpmnViewer()
  }

  ngOnDestroy(): void {
    if (this.bpmnModeler) {
      this.bpmnModeler.destroy()
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  ngOnChanges(): void {
    if (this.selectedModel && this.bpmnModeler) {
      this.loadModel()
    }
  }

  private initBpmnViewer(): void {
    const customModdleDescriptor = this.customElementsService.generateModdleDescriptor()

    // Use BpmnViewer with additional navigation modules
    this.bpmnModeler = new BpmnModeler({
      container: this.bpmnContainer.nativeElement,
      additionalModules: [
        // Navigation modules for better view-only experience
        ZoomScrollModule,
        MoveCanvasModule,
        // Custom modules
        {
          __init__: ["customElementsService", "customRenderer"],
          customElementsService: ["type", CustomElementsService],
          customRenderer: ["type", CustomRenderer],
        },
        {
          keyboardBindings: ["value", {}],
        },
      ],
      moddleExtensions: {
        custom: customModdleDescriptor,
      },
    })

    this.bpmnModeler._customElementsService = this.customElementsService

    this.bpmnModeler.on("import.done", (event: any) => {
      const {error, warnings} = event

      if (error) {
        this.error = `Failed to render diagram: ${error.message}`
        this.loading = false
        return
      }

      this.loading = false
      this.error = null

      const canvas = this.bpmnModeler.get("canvas")
      canvas.zoom("fit-viewport")

      // Retrieve information for all custom elements from backend
      this.handleCustomElements()

      // Configure view-only mode with proper navigation
      this.configureViewOnlyNavigation()

      if (warnings && warnings.length > 0) {
        console.warn("BPMN import warnings:", warnings)
      }
    })

    this.bpmnModeler.on("selection.changed", (event: any) => {
      const selection = event.newSelection

      if (selection && selection.length === 1) {
        const elementRegistry = this.bpmnModeler.get("elementRegistry")
        const element = elementRegistry.get(selection[0].id)

        if (element) {
          const businessObject = element.businessObject

          this.selectedElement = {
            id: businessObject.id,
            type: businessObject.$type.replace("bpmn:", ""),
            name: businessObject.name || "",
          }

          this.selectedElementObj = element

          this.changeDetectorRef.detectChanges()
        }
      } else {
        this.selectedElement = null
        this.selectedElementObj = null
        this.changeDetectorRef.detectChanges()
      }
    })

    // Load model if already available
    if (this.selectedModel) {
      this.loadModel()
    }
  }

  private loadModel(): void {
    if (!this.selectedModel || !this.bpmnModeler) return

    this.cancelJiraDataLoading()

    this.loading = true
    this.error = null
    this.selectedElement = null
    this.selectedElementObj = null

    this.bpmnModeler.importXML(this.selectedModel.xml).catch((error: Error) => {
      this.error = `Error importing BPMN diagram: ${error.message}`
      this.loading = false
    })
  }

  currentModelIsLatestVersion(): boolean {
    if (!this.selectedModel || !this.selectedSprint || !this.selectedSprint.models) return false
    return this.selectedSprint.models[this.selectedSprint.models.length - 1].id === this.selectedModel.id
  }

  private handleCustomElements(): void {
    if (!this.selectedModel || this.selectedSprint.status != 'active' || !this.currentModelIsLatestVersion()) return

    const elementRegistry = this.bpmnModeler.get("elementRegistry")
    const allElements = elementRegistry.getAll()

    const customElements = allElements.filter((el: any) => {
      const bo = el.businessObject
      return (
        bo.$attrs["custom:userStory"] === "true" ||
        bo.$attrs["custom:epic"] === "true" ||
        bo.$attrs["custom:subtask"] === "true"
      )
    })

    if (customElements.length === 0 || !this.selectedProject.jiraProjectKey) {
      this.isLoadingJiraData = false
      this.onModelFullyLoaded.emit()
      return
    }

    // Start loading state
    this.isLoadingJiraData = true
    this.totalJiraElements = customElements.length
    this.processedJiraElements = 0
    this.jiraDataProgress = 0

    let completedRequests = 0

    const updateProgress = () => {
      completedRequests++
      this.processedJiraElements = completedRequests
      this.jiraDataProgress = (completedRequests / this.totalJiraElements) * 100

      if (completedRequests === this.totalJiraElements) {
        setTimeout(() => {
          this.isLoadingJiraData = false
          this.saveChanges()
          this.onModelFullyLoaded.emit()
        }, 500)
      }
    }

    customElements.forEach((el: any) => {
      const bo = el.businessObject

      if (bo.$attrs["custom:userStory"] === "true") {
        const key = bo["userStoryKey"]
        if (key && this.selectedProject!.jiraProjectKey) {
          const sub = this.jiraService.getJiraStoryInformation(this.selectedProject!.jiraProjectKey, key).subscribe({
            next: (story) => {
              this.updateStoryElementProperties(el, story)
              updateProgress()
            },
            error: (err) => {
              console.error(`Failed to fetch story ${key}:`, err)
              updateProgress()
            },
          })
          this.subscriptions.push(sub)
        } else {
          updateProgress()
        }
      } else if (bo.$attrs["custom:epic"] === "true") {
        const key = bo["epicKey"]
        if (key && this.selectedProject!.jiraProjectKey) {
          const sub = this.jiraService.getJiraEpicInformation(this.selectedProject!.jiraProjectKey, key).subscribe({
            next: (epic) => {
              this.updateEpicElementProperties(el, epic)
              updateProgress()
            },
            error: (err) => {
              console.error(`Failed to fetch epic ${key}:`, err)
              updateProgress()
            },
          })
          this.subscriptions.push(sub)
        } else {
          updateProgress()
        }
      } else if (bo.$attrs["custom:subtask"] === "true") {
        const key = bo["subtaskKey"]
        if (key && this.selectedProject!.jiraProjectKey) {
          const sub = this.jiraService.getJiraSubtaskInformation(this.selectedProject!.jiraProjectKey, key).subscribe({
            next: (subtask) => {
              this.updateSubtaskElementProperties(el, subtask)
              updateProgress()
            },
            error: (err) => {
              console.error(`Failed to fetch subtask ${key}:`, err)
              updateProgress()
            },
          })
          this.subscriptions.push(sub)
        } else {
          updateProgress()
        }
      } else {
        updateProgress()
      }
    })
  }

  updateEpicElementProperties(element: any, issue: EpicDto): void {
    if (!element || !element.businessObject || !this.bpmnModeler) return
    const modeling = this.bpmnModeler.get("modeling")
    modeling.updateProperties(element, {
      "custom:epicKey": issue.key,
      "custom:epicTitle": issue.title,
      "custom:epicDescription": issue.description || "",
      "custom:epicStatus": issue.status || "",
      "custom:epicStatusCategory": this.resolveIssueStatusCategory(issue),
      "custom:epicDueDate": issue.dueDate || "",
      "custom:epicProgress": issue.progress || 0,
      "custom:epicIssueType": issue.issueType || "Epic",
      "custom:epicUrl": issue.url || "",
    })
  }

  updateStoryElementProperties(element: any, issue: UserStoryDto): void {
    if (!element || !element.businessObject || !this.bpmnModeler) return
    const modeling = this.bpmnModeler.get("modeling")
    modeling.updateProperties(element, {
      "custom:userStoryKey": issue.key,
      "custom:userStoryTitle": issue.title,
      "custom:userStoryDescription": issue.description || "",
      "custom:userStoryAssignee": issue.assignee || "",
      "custom:userStoryStatus": issue.status || "",
      "custom:userStoryStatusCategory": this.resolveIssueStatusCategory(issue),
      "custom:userStoryPriority": issue.priority || "",
      "custom:userStoryDueDate": issue.dueDate || "",
      "custom:userStoryProgress": issue.progress || 0,
      "custom:userStoryIssueType": issue.issueType || "Story",
      "custom:userStoryUrl": issue.url || "",
    })
  }

  updateSubtaskElementProperties(element: any, issue: SubtaskDto): void {
    if (!element || !element.businessObject || !this.bpmnModeler) return
    const modeling = this.bpmnModeler.get("modeling")
    modeling.updateProperties(element, {
      "custom:subtaskKey": issue.key,
      "custom:subtaskTitle": issue.title,
      "custom:subtaskDescription": issue.description || "",
      "custom:subtaskAssignee": issue.assignee || "",
      "custom:subtaskStatus": issue.status || "",
      "custom:subtaskStatusCategory": this.resolveIssueStatusCategory(issue),
      "custom:subtaskPriority": issue.priority || "",
      "custom:subtaskDueDate": issue.dueDate || "",
      "custom:subtaskIssueType": issue.issueType || "Task",
      "custom:subtaskUrl": issue.url || "",
    })
  }

  private resolveIssueStatusCategory(issue: EpicDto | UserStoryDto | SubtaskDto): string {
    return issue.statusCategory ? normalizeStatusCategory(issue.statusCategory) : getStatusCategoryForStatus(issue.status || "")
  }

  // Check if the selected element is a custom element
  isCustomElement(): boolean {
    if (!this.selectedElementObj || !this.selectedElementObj.businessObject) {
      return false
    }

    const bo = this.selectedElementObj.businessObject

    // Check for custom element attributes
    return (
      bo.$attrs["custom:userStory"] === "true" ||
      bo.$attrs["custom:epic"] === "true" ||
      bo.$attrs["custom:subtask"] === "true"
    )
  }

  private configureViewOnlyNavigation(): void {
    try {
      const canvas = this.bpmnModeler.get("canvas")
      const eventBus = this.bpmnModeler.get("eventBus")

      // Disable direct editing if available
      try {
        const directEditing = this.bpmnModeler.get("directEditing")
        if (directEditing && directEditing.registerProvider) {
          directEditing.registerProvider = () => {
          }
        }
      } catch (e) {
        // Direct editing might not be available in viewer mode
      }

      // Disable element moving while keeping selection
      eventBus.on("element.mousedown", 1500, (event: any) => {
        // Allow selection but prevent dragging for moves
        if (event.originalEvent && event.originalEvent.button === 0) {
          // Check if this is a move attempt vs selection
          const element = event.element
          if (element && element.businessObject) {
            // Allow selection but stop move propagation
            event.stopPropagation = () => {
            }
          }
        }
      })

      // Configure canvas for better navigation
      const canvasContainer = canvas.getContainer()

      // Set appropriate cursor styles
      canvasContainer.style.cursor = "default"

      // Add view-only class for styling
      canvasContainer.classList.add("view-only-mode")

      console.log("View-only navigation configured successfully")
    } catch (error) {
      console.warn("Some navigation features might not be available:", error)
    }
  }

  zoomIn(): void {
    if (this.bpmnModeler) {
      const canvas = this.bpmnModeler.get("canvas")
      canvas.zoom(canvas.zoom() + 0.1)
    }
  }

  zoomOut(): void {
    if (this.bpmnModeler) {
      const canvas = this.bpmnModeler.get("canvas")
      canvas.zoom(canvas.zoom() - 0.1)
    }
  }

  resetZoom(): void {
    if (this.bpmnModeler) {
      const canvas = this.bpmnModeler.get("canvas")
      canvas.zoom("fit-viewport")
    }
  }

  saveChanges(): void {
    if (!this.bpmnModeler || !this.selectedModel) return

    this.bpmnModeler
      .saveXML({format: true})
      .then((result: any) => {
        const {xml} = result

        const sub = this.bpmnModelApiService
          .updateBpmnModel({
            "bpmn-model-id": this.selectedModel!.id,
            body: {
              name: this.selectedModel!.name,
              bpmnXml: xml,
            },
          })
          .subscribe({
            next: () => {
              setTimeout(() => {
              }, 3000)
            },
            error: (err) => {
              this.error = `Error saving diagram: ${err.message}`
            },
          })

        this.subscriptions.push(sub)
      })
      .catch((error: Error) => {
        this.error = `Error saving diagram: ${error.message}`
      })
  }

  private cancelJiraDataLoading(): void {
    // Cancel all ongoing subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions = []

    // Reset Jira loading state immediately
    this.isLoadingJiraData = false
    this.jiraDataProgress = 0
    this.totalJiraElements = 0
    this.processedJiraElements = 0
  }
}
