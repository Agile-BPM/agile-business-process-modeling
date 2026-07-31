import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  HostListener,
  type OnDestroy,
  type OnInit,
  ViewChild,
} from "@angular/core"
import {ActivatedRoute, Router} from "@angular/router"
import {NgIf} from "@angular/common"
import {FormsModule} from "@angular/forms"
import {CustomElementsService} from "../../services/custom-elements.service"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {Subscription} from "rxjs"
import BpmnModeler from "bpmn-js/lib/Modeler"
import gridModule from 'diagram-js-grid';
import CustomPaletteProvider from "../../custom-modeler/custom-palette-provider"
import CustomRenderer from "../../custom-modeler/custom-renderer"
import {CustomPropertiesPanelComponent} from "../custom-properties-panel/custom-properties-panel.component"
import CustomContextPadProvider from "../../custom-modeler/custom-context-pad"
import {JiraService} from "../../services/jira.service";
import {UserDto} from "../../services/data/user-dto";
import {UserService} from "../../services/user.service";
import {BpmnModelDto} from "../../services/data/bpmn-model-dto";
import {EpicDto} from "../../services/data/epic-dto";
import {UserStoryDto} from "../../services/data/user-story-dto";
import {SubtaskDto} from "../../services/data/subtask-dto";
import {HeartbeatService} from "../../services/heartbeat.service";
import {CustomPaletteComponent} from "../custom-palette/custom-palette.component"

@Component({
    selector: "app-model-edit",
    imports: [NgIf, FormsModule, CustomPropertiesPanelComponent, CustomPaletteComponent],
    templateUrl: "./model-edit.component.html",
    styleUrl: "./model-edit.component.css"
})
export class ModelEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("bpmnContainer") bpmnContainer!: ElementRef

  protected bpmnModeler: any
  protected paletteBpmnModeler: any
  private modelSubscription?: Subscription

  protected allJiraEpics: EpicDto[] = []
  protected allJiraStories: UserStoryDto[] = []
  protected allJiraSubtasks: SubtaskDto[] = []

  // User info
  user: UserDto = {
    firstname: "",
    lastname: "",
    email: "",
    isJiraAuthenticated: false,
  }

  loading = true
  error: string | null = null
  currentModelId = 0
  saveSuccess = false
  hasUnsavedChanges = false

  // Model details
  currentModel: BpmnModelDto | null = null
  isEditingName = false
  tempModelName = ""

  canUndo = false
  canRedo = false

  selectedElement: any = null
  selectedElementObj: any = null

  // Jira integration
  jiraProjectKey: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bpmnModelApiService: BpmnModelApiService,
    private customElementsService: CustomElementsService,
    private changeDetectorRef: ChangeDetectorRef,
    private jiraService: JiraService,
    private userService: UserService,
    private heartbeatService: HeartbeatService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.currentModelId = +this.route.snapshot.params['id'];
    this.jiraProjectKey = this.route.snapshot.queryParams['jiraProjectKey'] || null;
    this.loadCurrentModel()

    this.loadUserInfo()
  }

  ngAfterViewInit(): void {
    this.initBpmnModeler()
  }

  ngOnDestroy(): void {
    this.heartbeatService.stopHeartbeat(this.user.email, this.currentModelId);
    if (this.bpmnModeler) {
      this.bpmnModeler.destroy()
    }
    if (this.modelSubscription) {
      this.modelSubscription.unsubscribe()
    }
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

  private initBpmnModeler(): void {
    const customModdleDescriptor = this.customElementsService.generateModdleDescriptor()

    this.bpmnModeler = new BpmnModeler({
      container: this.bpmnContainer.nativeElement,
      additionalModules: [
        {
          __init__: ["customElementsService", "customPaletteProvider", "customRenderer", "customContextPadProvider"],
          customElementsService: ["type", CustomElementsService],
          customPaletteProvider: ["type", CustomPaletteProvider],
          customRenderer: ["type", CustomRenderer],
          customContextPadProvider: ["type", CustomContextPadProvider],
        },
        gridModule
      ],
      moddleExtensions: {
        custom: customModdleDescriptor,
      },
    })
    queueMicrotask(() => {
      this.paletteBpmnModeler = this.bpmnModeler
      this.changeDetectorRef.detectChanges()
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

      this.fitViewport()

      if (warnings && warnings.length > 0) {
        console.warn("BPMN import warnings:", warnings)
      }

      this.hasUnsavedChanges = false
      this.updateUndoRedoState()
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

    this.bpmnModeler.on("commandStack.changed", () => {
      this.hasUnsavedChanges = true
      this.updateUndoRedoState()
    })

    this.importCurrentModel()
  }

  loadCurrentModel(): void {
    this.loading = true
    this.error = null

    this.selectedElement = null
    this.selectedElementObj = null

    this.bpmnModelApiService.getBpmnModelById(this.currentModelId).subscribe({
      next: (model) => {
        if (!model) {
          this.error = "Model not found"
          this.loading = false
          return
        }

        this.currentModel = model
        this.tempModelName = model.name
        this.importCurrentModel()
      },
      error: (err) => {
        this.error = `Error loading model: ${err.message}`
        this.loading = false
      },
    })
  }

  private importCurrentModel(): void {
    if (!this.bpmnModeler || !this.currentModel) {
      return
    }

    this.bpmnModeler.importXML(this.currentModel.bpmnXml).catch((error: Error) => {
      this.error = `Error importing BPMN diagram: ${error.message}`
      this.loading = false
    })
  }

  updateUndoRedoState(): void {
    const commandStack = this.bpmnModeler.get("commandStack")
    this.canUndo = commandStack.canUndo()
    this.canRedo = commandStack.canRedo()
  }

  // Navigation
  goBack(): void {
    this.heartbeatService.stopHeartbeat(this.user.email, this.currentModelId);
    this.router.navigate([""])
  }

  canDeactivate(): boolean {
    return this.confirmDiscardChangesIfNeeded()
  }

  @HostListener("window:beforeunload", ["$event"])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges) {
      return
    }
    event.preventDefault()
    event.returnValue = true
  }

  // Model name editing
  startEditingName(): void {
    this.isEditingName = true
    this.tempModelName = this.currentModel.name
  }

  cancelEditingName(): void {
    this.isEditingName = false
    this.tempModelName = this.currentModel.name
  }

  saveModelName(): void {
    if (!this.tempModelName.trim()) {
      return
    }

    this.bpmnModelApiService.getBpmnModelById(this.currentModelId).subscribe({
      next: (model) => {
        if (model) {
          this.bpmnModelApiService
            .updateBpmnModel({
              "bpmn-model-id": this.currentModelId,
              body: {
                name: this.tempModelName.trim(),
                bpmnXml: model.bpmnXml,
              },
            })
            .subscribe({
              next: (model) => {
                this.currentModel = model
                this.isEditingName = false
                this.saveSuccess = true
                setTimeout(() => {
                  this.saveSuccess = false
                }, 3000)
              },
              error: (err) => {
                this.error = `Error saving model name: ${err.message}`
              },
            })
        }
      },
      error: (err) => {
        this.error = `Error loading model: ${err.message}`
      },
    })
  }

  // Canvas controls
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
      this.fitViewport()
    }
  }

  private fitViewport(): void {
    const canvas = this.bpmnModeler.get("canvas")
    canvas.zoom("fit-viewport", true)
  }

  undo(): void {
    if (this.bpmnModeler && this.canUndo) {
      const commandStack = this.bpmnModeler.get("commandStack")
      commandStack.undo()
      this.updateUndoRedoState()
    }
  }

  redo(): void {
    if (this.bpmnModeler && this.canRedo) {
      const commandStack = this.bpmnModeler.get("commandStack")
      commandStack.redo()
      this.updateUndoRedoState()
    }
  }

  updateElementName(event: Event): void {
    if (!this.selectedElement) return

    const newName = (event.target as HTMLInputElement).value

    const modeling = this.bpmnModeler.get("modeling")
    const elementRegistry = this.bpmnModeler.get("elementRegistry")

    const element = elementRegistry.get(this.selectedElement.id)

    if (element) {
      modeling.updateProperties(element, {
        name: newName,
      })

      this.selectedElement.name = newName
    }
  }

  saveChanges(): void {
    if (!this.bpmnModeler) return

    this.bpmnModeler
      .saveXML({format: true})
      .then((result: any) => {
        const {xml} = result

        this.bpmnModelApiService
          .updateBpmnModel({
            "bpmn-model-id": this.currentModelId,
            body: {
              name: this.currentModel.name,
              bpmnXml: xml,
            },
          })
          .subscribe({
            next: () => {
              this.hasUnsavedChanges = false
              this.saveSuccess = true
              setTimeout(() => {
                this.saveSuccess = false
              }, 3000)
            },
            error: (err) => {
              this.error = `Error saving diagram: ${err.message}`
            },
          })
      })
      .catch((error: Error) => {
        this.error = `Error saving diagram: ${error.message}`
      })
  }

  exportDiagram(): void {
    this.bpmnModelApiService.getBpmnModelById(this.currentModelId).subscribe((model) => {
      if (model) {
        const blob = new Blob([model.bpmnXml], {type: "application/xml"})
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${model.name.replace(/\s+/g, "_")}.bpmn`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }

  loadUserInfo(): void {
    this.userService.getUser().subscribe({
      next: user => {
        this.user = user
        this.loadJiraProjects();
        this.heartbeatService.startHeartbeat(user.email, this.currentModelId);
      }
    })
  }

  loadJiraProjects(): void {
    if (this.user.isJiraAuthenticated) {
      if (this.user.isJiraAuthenticated && this.jiraProjectKey != null) {
        this.jiraService.getAllJiraEpics(this.jiraProjectKey).subscribe((epics) => {
          this.allJiraEpics = epics;
        })
        this.jiraService.getAllJiraStories(this.jiraProjectKey).subscribe((stories) => {
          this.allJiraStories = stories;
        })
        this.jiraService.getAllJiraSubtasks(this.jiraProjectKey).subscribe((subtasks) => {
          this.allJiraSubtasks = subtasks;
        })
      }
    }
  }

  isElementEditable(): boolean {
    if (!this.selectedElementObj) return false
    const bo = this.selectedElementObj.businessObject

    if (bo.$attrs["custom:epic"]) {
      return !this.isLinkedToJiraIssue(bo["epicUrl"])
    } else if (bo.$attrs["custom:userStory"]) {
      return !this.isLinkedToJiraIssue(bo["userStoryUrl"])
    } else if (bo.$attrs["custom:subtask"]) {
      return !this.isLinkedToJiraIssue(bo["subtaskUrl"])
    }

    return true
  }

  private isLinkedToJiraIssue(issueUrl: string | undefined): boolean {
    return typeof issueUrl === "string" && issueUrl.trim().length > 0
  }

  private confirmDiscardChangesIfNeeded(): boolean {
    if (!this.hasUnsavedChanges) {
      return true
    }

    return confirm("You have unsaved changes. If you leave now, your changes will be lost.")
  }
}
