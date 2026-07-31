import {
  type AfterViewInit,
  Component,
  type ElementRef,
  EventEmitter,
  Input,
  type OnDestroy,
  type OnInit,
  Output,
  ViewChild,
} from "@angular/core"
import {NgForOf, NgIf} from "@angular/common"
import {BpmnModelApiService} from "../../services/api/bpmn-model-api.service"
import {CustomElementsService} from "../../services/custom-elements.service"

// Import bpmn-js components
import CustomRendererDiffingView from "../../custom-modeler/custom-renderer-diffing-view"
import BpmnModeler from "bpmn-js/lib/Modeler";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";

@Component({
    selector: "app-bpmn-diff-viewer",
    imports: [NgIf, NgForOf],
    templateUrl: "./bpmn-diff-viewer.component.html",
    styleUrl: "./bpmn-diff-viewer.component.css"
})
export class BpmnDiffViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("oldContainer") oldContainer!: ElementRef
  @ViewChild("newContainer") newContainer!: ElementRef

  @Input() currentModel: any = null
  @Input() previousModel: any = null
  @Output() onClose = new EventEmitter<void>()

  private oldViewer: any
  private newViewer: any

  loading = true
  error: string | null = null

  currentModelData: any = null
  previousModelData: any = null

  overviewExpanded = false
  changesSummary: any[] = []

  constructor(
    private bpmnModelApiService: BpmnModelApiService,
    private customElementsService: CustomElementsService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.loadModels()
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initViewers()
  }

  ngOnDestroy(): void {
    // Clean up diff icons
    this.cleanupDiffIcons()

    if (this.oldViewer) {
      this.oldViewer.destroy()
    }
    if (this.newViewer) {
      this.newViewer.destroy()
    }
  }

  private async loadModels(): Promise<void> {
    if (!this.currentModel || !this.previousModel) {
      this.error = "Models not provided"
      this.loading = false
      return
    }

    this.previousModelData = await this.bpmnModelApiService.getBpmnModelById(this.previousModel.id).toPromise()
    this.currentModelData = await this.bpmnModelApiService.getBpmnModelById(this.currentModel.id).toPromise()
    this.loading = false
    if (this.oldViewer && this.newViewer) {
      await this.performDiff()
    }
  }

  private async initViewers(): Promise<void> {
    const customModdleDescriptor = this.customElementsService.generateModdleDescriptor()
    // Initialize viewers with custom renderer
    this.oldViewer = new BpmnModeler({
      container: this.oldContainer.nativeElement,
      width: "100%",
      height: "100%",
      additionalModules: [
        ZoomScrollModule,
        MoveCanvasModule,
        {
          __init__: ["customElementsService", "customRenderer"],
          customRenderer: ["type", CustomRendererDiffingView],
          customElementsService: ["type", CustomElementsService],
        },
        {
          keyboardBindings: ["value", {}],
        },
      ],
      moddleExtensions: {
        custom: customModdleDescriptor,
      },
    })

    this.newViewer = new BpmnModeler({
      container: this.newContainer.nativeElement,
      width: "100%",
      height: "100%",
      additionalModules: [
        ZoomScrollModule,
        MoveCanvasModule,
        {
          __init__: ["customElementsService", "customRenderer"],
          customRenderer: ["type", CustomRendererDiffingView],
          customElementsService: ["type", CustomElementsService],
        },
        {
          keyboardBindings: ["value", {}],
        },
      ],
      moddleExtensions: {
        custom: customModdleDescriptor,
      },
    })

    this.oldViewer.on("import.done", (event: any) => {
      this.configureViewOnlyNavigation(this.oldViewer);
    })
    this.newViewer.on("import.done", (event: any) => {
      this.configureViewOnlyNavigation(this.newViewer);
    })

    if (this.previousModelData && this.currentModelData) {
      await this.performDiff()
    }
  }

  private async performDiff(): Promise<void> {
    if (!this.previousModelData || !this.currentModelData || !this.oldViewer || !this.newViewer) {
      return
    }

    try {
      // Import the BPMN diagrams
      await this.oldViewer.importXML(this.previousModelData.bpmnXml)
      await this.newViewer.importXML(this.currentModelData.bpmnXml)

      // Perform a simple diff by comparing element IDs and properties
      const changes = this.calculateDiff(this.previousModelData.bpmnXml, this.currentModelData.bpmnXml)

      // Apply visual diff to both viewers
      this.applyDiffVisualization(changes)

      // Fit viewports
      this.oldViewer.get("canvas").zoom("fit-viewport")
      this.newViewer.get("canvas").zoom("fit-viewport")
    } catch (error: any) {
      this.error = `Error performing diff: ${error.message}`
    }
  }

  private calculateDiff(oldXml: string, newXml: string): any {
    try {
      // Parse XML to get element information
      const parser = new DOMParser()
      const oldDoc = parser.parseFromString(oldXml, "text/xml")
      const newDoc = parser.parseFromString(newXml, "text/xml")

      // Get all elements with IDs from both documents
      const oldElements = this.extractCustomElements(oldDoc)
      const newElements = this.extractCustomElements(newDoc)

      const changes: any = {}
      this.changesSummary = []

      // Find removed elements
      for (const [id, element] of oldElements) {
        if (!newElements.has(id)) {
          const change = {_removed: true, element}
          changes[id] = change

          // Add to summary
          this.changesSummary.push({
            type: "removed",
            elementId: id,
            elementKey: this.getElementKey(element),
            elementTitle: this.getElementTitle(element),
            elementType: this.getElementType(element),
            descriptions: ["Element was removed from the model"],
          })
        }
      }

      // Find added and changed elements
      for (const [id, element] of newElements) {
        if (!oldElements.has(id)) {
          const change = {_added: true, element}
          changes[id] = change

          // Add to summary
          this.changesSummary.push({
            type: "added",
            elementId: id,
            elementKey: this.getElementKey(element),
            elementTitle: this.getElementTitle(element),
            elementType: this.getElementType(element),
            descriptions: ["Element was added to the model"],
          })
          continue
        }

        const oldElement = oldElements.get(id)
        const changeDetails = this.getDetailedChanges(oldElement, element)

        if (changeDetails.length > 0) {
          changes[id] = {_changed: true, element, oldElement}

          // Add to summary
          this.changesSummary.push({
            type: "changed",
            elementId: id,
            elementKey: this.getElementKey(element),
            elementTitle: this.getElementTitle(element),
            elementType: this.getElementType(element),
            descriptions: changeDetails,
          })
        }
      }

      return changes
    } catch (error: any) {
      console.error("Error calculating diff:", error)
      return {}
    }
  }

  private extractCustomElements(doc: Document): Map<string, Element> {
    const elements = new Map<string, Element>()
    const allElements = doc.querySelectorAll("[id]")

    allElements.forEach((element) => {
      if (this.isCustomElement(element)) {
        const id = element.getAttribute("id")
        if (id) {
          elements.set(id, element)
        }
      }
    })

    return elements
  }

  private isCustomElement(element: Element): boolean {
    return !!(
      element.getAttribute("custom:userStory") ||
      element.getAttribute("custom:epic") ||
      element.getAttribute("custom:subtask")
    )
  }

  private elementsAreDifferent(oldElement: Element, newElement: Element): boolean {
    // Compare element names
    if (oldElement.getAttribute("name") !== newElement.getAttribute("name")) {
      return true
    }

    // Compare custom attributes for UserStory, Epic, Subtask
    const customAttributes = [
      "custom:userStoryTitle",
      "custom:userStoryStatus",
      "custom:userStoryAssignee",
      "custom:userStoryPriority",
      "custom:userStoryProgress",
      "custom:userStoryKey",
      "custom:epicTitle",
      "custom:epicProgress",
      "custom:epicKey",
      "custom:subtaskTitle",
      "custom:subtaskStatus",
      "custom:subtaskAssignee",
      "custom:subtaskPriority",
      "custom:subtaskKey",
    ]

    for (const attr of customAttributes) {
      if (oldElement.getAttribute(attr) !== newElement.getAttribute(attr)) {
        return true
      }
    }

    // Compare other relevant attributes
    const standardAttributes = ["name", "documentation", "sourceRef", "targetRef"]
    for (const attr of standardAttributes) {
      if (oldElement.getAttribute(attr) !== newElement.getAttribute(attr)) {
        return true
      }
    }

    return false
  }

  private getElementKey(element: Element): string {
    // Try to get custom titles first
    const userStoryKey = element.getAttribute("custom:userStoryKey")
    const epicKey = element.getAttribute("custom:epicKey")
    const subtaskKey = element.getAttribute("custom:subtaskKey")

    if (userStoryKey) return userStoryKey
    if (epicKey) return epicKey
    if (subtaskKey) return subtaskKey

    // Fall back to name attribute or ID
    return element.getAttribute("name") || element.getAttribute("id") || "Unnamed Element"
  }

  private getElementTitle(element: Element): string {
    // Try to get custom titles first
    const userStoryTitle = element.getAttribute("custom:userStoryTitle")
    const epicTitle = element.getAttribute("custom:epicTitle")
    const subtaskTitle = element.getAttribute("custom:subtaskTitle")

    if (userStoryTitle) return userStoryTitle
    if (epicTitle) return epicTitle
    if (subtaskTitle) return subtaskTitle

    // Fall back to name attribute or ID
    return element.getAttribute("name") || element.getAttribute("id") || "Unnamed Element"
  }

  private getElementType(element: Element): string {
    if (element.getAttribute("custom:userStory")) return "User Story"
    if (element.getAttribute("custom:epic")) return "Epic"
    if (element.getAttribute("custom:subtask")) return "Subtask"

    // Determine by element tag name
    const tagName = element.tagName.toLowerCase()
    if (tagName.includes("task")) return "Task"
    if (tagName.includes("gateway")) return "Gateway"
    if (tagName.includes("event")) return "Event"
    if (tagName.includes("flow")) return "Sequence Flow"

    return "Element"
  }

  private getDetailedChanges(oldElement: Element, newElement: Element): string[] {
    const changes: string[] = []

    // Check name changes
    const oldName = oldElement.getAttribute("name")
    const newName = newElement.getAttribute("name")
    if (oldName !== newName) {
      changes.push(`Name changed from "${oldName || "Unnamed"}" to "${newName || "Unnamed"}"`)
    }

    // Check custom attribute changes
    const attributeChecks = [
      {attr: "custom:userStoryTitle", label: "Title"},
      {attr: "custom:userStoryStatus", label: "Status"},
      {attr: "custom:userStoryAssignee", label: "Assignee"},
      {attr: "custom:userStoryPriority", label: "Priority"},
      {attr: "custom:userStoryProgress", label: "Progress", isProgress: true},
      {attr: "custom:epicTitle", label: "Title"},
      {attr: "custom:epicProgress", label: "Progress", isProgress: true},
      {attr: "custom:subtaskTitle", label: "Title"},
      {attr: "custom:subtaskStatus", label: "Status"},
      {attr: "custom:subtaskAssignee", label: "Assignee"},
      {attr: "custom:subtaskPriority", label: "Priority"},
    ]

    for (const check of attributeChecks) {
      const oldValue = oldElement.getAttribute(check.attr)
      const newValue = newElement.getAttribute(check.attr)

      if (oldValue !== newValue && (oldValue || newValue)) {
        let changeText = `${check.label} changed from "${oldValue || "None"}" to "${newValue || "None"}"`

        if (check.isProgress && oldValue && newValue) {
          changeText = `${check.label} changed from ${this.roundProgress(Number(oldValue) * 100)}% to ${Number(newValue) * 100}%`
        }

        changes.push(changeText)
      }
    }

    return changes
  }

  roundProgress(value: number): number {
    return Math.round(value);
  }

  private applyDiffVisualization(changes: any): void {
    const oldElementRegistry = this.oldViewer.get("elementRegistry")
    const newElementRegistry = this.newViewer.get("elementRegistry")
    const oldViewerModeling = this.oldViewer.get("modeling")
    const newViewerModeling = this.newViewer.get("modeling")

    // Apply changes visualization with simple icons only
    Object.keys(changes).forEach((elementId) => {
      const change = changes[elementId]

      if (change._removed) {
        // Element was removed - add icon on old diagram
        const oldElement = oldElementRegistry.get(elementId)
        if (oldElement) {
          oldViewerModeling.updateProperties(oldElement, {"removed": "true"})
          this.addDiffIcon(this.oldViewer, oldElement, "removed")
        }
      } else if (change._added) {
        // Element was added - add icon on new diagram
        const newElement = newElementRegistry.get(elementId)
        if (newElement) {
          newViewerModeling.updateProperties(newElement, {"added": "true"})
          this.addDiffIcon(this.newViewer, newElement, "added")
        }
      } else if (change._changed) {
        // Element was changed - add icon on both diagrams
        const oldElement = oldElementRegistry.get(elementId)
        const newElement = newElementRegistry.get(elementId)

        if (oldElement) {
          oldViewerModeling.updateProperties(oldElement, {"changed": "true"})
          this.addDiffIcon(this.oldViewer, oldElement, "changed")
        }
        if (newElement) {
          newViewerModeling.updateProperties(newElement, {"changed": "true"})
          this.addDiffIcon(this.newViewer, newElement, "changed")
        }
      }
    })
  }

  private addDiffIcon(viewer: any, element: any, changeType: "added" | "removed" | "changed"): void {
    const textSize = 12
    const padding = 4

    // Calculate position (left above the element)
    const elementBounds = element
    const x = elementBounds.x - padding
    const y = elementBounds.y - textSize - padding

    // Create text label based on change type
    let labelText = ""
    let labelColor = ""

    switch (changeType) {
      case "removed":
        labelText = "removed"
        labelColor = "#ef5350"
        break
      case "added":
        labelText = "added"
        labelColor = "#4caf50"
        break
      case "changed":
        labelText = "edited"
        labelColor = "#ff9800"
        break
    }

    // Create overlay HTML element with text
    const overlayHtml = `
    <div class="diff-text-overlay" style="
      position: absolute;
      pointer-events: none;
      z-index: 100;
      font-size: ${textSize}px;
      color: ${labelColor};
      padding: 6px 6px 0;
    ">
      ${labelText}
    </div>
  `

    // Add overlay to canvas
    const overlayContainer = document.createElement("div")
    overlayContainer.innerHTML = overlayHtml
    const overlay = overlayContainer.firstElementChild as HTMLElement

    // Use BPMN.js overlay API to position the text label left above the element
    const overlays = viewer.get("overlays")
    if (overlays) {
      overlays.add(element.id, {
        position: {
          top: -textSize - padding * 2,
          left: -padding,
        },
        html: overlay,
      })
    }
  }

  close(): void {
    this.onClose.emit()
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close()
    }
  }

  private cleanupDiffIcons(): void {
    // Clean up overlays
    if (this.oldViewer) {
      const oldOverlays = this.oldViewer.get("overlays")
      if (oldOverlays) {
        oldOverlays.clear()
      }
    }
    if (this.newViewer) {
      const newOverlays = this.newViewer.get("overlays")
      if (newOverlays) {
        newOverlays.clear()
      }
    }
  }

  toggleOverview(): void {
    this.overviewExpanded = !this.overviewExpanded
  }

  zoomInOld(): void {
    if (this.oldViewer) {
      const canvas = this.oldViewer.get("canvas")
      canvas.zoom(canvas.zoom() * 1.2)
    }
  }

  zoomOutOld(): void {
    if (this.oldViewer) {
      const canvas = this.oldViewer.get("canvas")
      canvas.zoom(canvas.zoom() / 1.2)
    }
  }

  resetZoomOld(): void {
    if (this.oldViewer) {
      const canvas = this.oldViewer.get("canvas")
      canvas.zoom("fit-viewport")
    }
  }

  zoomInNew(): void {
    if (this.newViewer) {
      const canvas = this.newViewer.get("canvas")
      canvas.zoom(canvas.zoom() * 1.2)
    }
  }

  zoomOutNew(): void {
    if (this.newViewer) {
      const canvas = this.newViewer.get("canvas")
      canvas.zoom(canvas.zoom() / 1.2)
    }
  }

  resetZoomNew(): void {
    if (this.newViewer) {
      const canvas = this.newViewer.get("canvas")
      canvas.zoom("fit-viewport")
    }
  }

  private configureViewOnlyNavigation(modeler: any) {
    try {
      const canvas = modeler.get("canvas")
      const eventBus = modeler.get("eventBus")

      // Disable direct editing if available
      try {
        const directEditing = modeler.get("directEditing")
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
}
