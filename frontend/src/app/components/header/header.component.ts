import {Component, EventEmitter, Input, OnChanges, type OnDestroy, type OnInit, Output} from "@angular/core"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {Router} from "@angular/router"
import type {Subscription} from "rxjs"
import {NgIf} from "@angular/common"
import SockJS from "sockjs-client"
import {type CompatClient, Stomp, type StompSubscription} from "@stomp/stompjs"
import {ApiConfiguration} from "../../services/api-configuration"
import {ModelItem, ProjectItem, SprintItem} from "../main-layout/main-layout.component";

// todo: model locking and unlocking should be handled in main layout and passed as parameter to this component

@Component({
    selector: "app-header",
    imports: [NgIf],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.css"
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedModel: ModelItem | null = null
  @Input() currentProject: ProjectItem | null = null
  @Input() currentSprint: SprintItem | null = null
  @Input() isModelFreeToEdit = false

  @Output() onProjectSettingsDialogOpened = new EventEmitter<void>()

  private stompClient: CompatClient
  private modelLockedSubscription?: StompSubscription
  private modelFreeSubscription?: StompSubscription
  private subscriptions: Subscription[] = []

  isModelUnlocked = false
  modelIsEditedBy = null

  constructor(
    private bpmnModelApiService: BpmnModelApiService,
    private router: Router,
    private config: ApiConfiguration,
  ) {
  }

  ngOnInit(): void {
    const socket = new SockJS(this.config.rootUrl + "/ws")
    this.stompClient = Stomp.over(socket)

    this.stompClient.connect({}, (frame) => {
      console.log("Connected: " + frame)
    })
    this.updateModelEditStatus()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())

    if (this.modelLockedSubscription) {
      this.modelLockedSubscription.unsubscribe()
    }
    if (this.modelFreeSubscription) {
      this.modelFreeSubscription.unsubscribe()
    }
  }

  ngOnChanges(): void {
    if (this.selectedModel) {
      this.setupWebSocketSubscriptions()
      this.updateModelEditStatus()
    }
  }

  currentModelIsLatestVersion(): boolean {
    if (!this.selectedModel || !this.currentSprint || !this.currentSprint.models) {
      return false
    }
    return this.currentSprint.models[this.currentSprint.models.length - 1].id === this.selectedModel.id
  }

  private setupWebSocketSubscriptions(): void {
    if (!this.selectedModel) return

    // Unsubscribe from previous model subscriptions
    if (this.modelLockedSubscription) {
      this.modelLockedSubscription.unsubscribe()
    }
    if (this.modelFreeSubscription) {
      this.modelFreeSubscription.unsubscribe()
    }

    // Subscribe to new model events
    this.modelFreeSubscription = this.stompClient.subscribe("/topic/model-free/" + this.selectedModel.id, () => {
      this.isModelUnlocked = true
      this.modelIsEditedBy = null
    })

    this.modelLockedSubscription = this.stompClient.subscribe(
      "/topic/model-locked/" + this.selectedModel.id,
      (message) => {
        this.isModelUnlocked = false
        this.modelIsEditedBy = message.body
      },
    )
  }

  editModel(): void {
    if (this.selectedModel) {
      const jiraProjectKey = this.currentProject.jiraProjectKey
      if (jiraProjectKey) {
        this.router.navigate(["/edit", this.selectedModel.id], {
          queryParams: {jiraProjectKey: jiraProjectKey},
        })
      } else {
        this.router.navigate(["/edit", this.selectedModel.id])
      }
    }
  }

  openProjectSettings(): void {
    this.onProjectSettingsDialogOpened.emit()
  }

  updateModelEditStatus(): void {
    if (!this.selectedModel) return

    const sub = this.bpmnModelApiService.getModelStatus(this.selectedModel.id).subscribe({
      next: (modelEditStatus) => {
        this.isModelUnlocked = modelEditStatus.isFree
        this.modelIsEditedBy = modelEditStatus.editorName
      },
      error: (err) => {
        console.error("Error fetching model edit status:", err)
        this.isModelUnlocked = false
        this.modelIsEditedBy = null
      },
    })

    this.subscriptions.push(sub)
  }

  isModelLocked(): boolean {
    return !this.isModelUnlocked || !this.isModelFreeToEdit
  }

}
