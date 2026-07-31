import {Component, Input, type OnChanges, type OnDestroy, type SimpleChanges} from "@angular/core"
import {CustomElementsService} from "../../services/custom-elements.service"
import type {CustomElement, CustomProperty} from "../../services/models/custom-elements"
import {NgForOf, NgIf} from "@angular/common"
import {FormsModule} from "@angular/forms"
import type {JiraIssueDto} from "../../services/data/jira-issue-dto"
import {of, Subject} from "rxjs"
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from "rxjs/operators"
import {EpicDto} from "../../services/data/epic-dto";
import {SubtaskDto} from "../../services/data/subtask-dto";
import {UserStoryDto} from "../../services/data/user-story-dto";
import {getStatusCategoryForStatus, normalizeStatusCategory} from "../../services/models/status-category";

@Component({
    selector: "app-custom-properties-panel",
    imports: [NgForOf, NgIf, FormsModule],
    templateUrl: "./custom-properties-panel.component.html",
    styleUrl: "./custom-properties-panel.component.css"
})
export class CustomPropertiesPanelComponent implements OnChanges, OnDestroy {
  @Input() selectedElement: any
  @Input() modeler: any
  @Input() isEditMode: any
  @Input() jiraProjectKey?: string
  @Input() allJiraEpics?: EpicDto[]
  @Input() allJiraStories?: UserStoryDto[]
  @Input() allJiraSubtasks?: SubtaskDto[]

  customElement: CustomElement | null = null

  // Jira issue assignment
  searchQuery = ""
  searchResults: JiraIssueDto[] = []
  showSearchResults = false
  isLoading = false
  isSearching = false
  private searchSubject = new Subject<string>()
  private destroy$ = new Subject<void>()

  constructor(
    private customElementsService: CustomElementsService,
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) {
            return []
          }
          this.isLoading = true
          const issueType = this.getElementTypeForSearch()

          if (issueType === "epic") {
            return of(this.allJiraEpics?.filter((issue) =>
              issue.key.toLowerCase().includes(query.toLowerCase()) ||
              issue.title.toLowerCase().includes(query.toLowerCase()))) || of([])
          } else if (issueType === "userStory") {
            return of(this.allJiraStories?.filter((issue) =>
              issue.key.toLowerCase().includes(query.toLowerCase()) ||
              issue.title.toLowerCase().includes(query.toLowerCase()))) || of([])
          } else if (issueType === "subtask") {
            return of(this.allJiraSubtasks?.filter((issue) =>
              issue.key.toLowerCase().includes(query.toLowerCase()) ||
              issue.title.toLowerCase().includes(query.toLowerCase()))) || of([])
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results
          this.isLoading = false
          this.showSearchResults = true
        },
        error: (error) => {
          console.error("Error searching Jira issues:", error)
          this.searchResults = []
          this.isLoading = false
          this.showSearchResults = false
        },
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedElement"] && this.selectedElement) {
      this.detectCustomElement()
      this.resetSearch()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  detectCustomElement(): void {
    if (!this.selectedElement || !this.selectedElement.businessObject) {
      this.customElement = null
      return
    }

    const bo = this.selectedElement.businessObject
    const customElements = this.customElementsService.getCustomElements()
    for (const customElement of customElements) {
      const [namespace, type] = customElement.type.split(":")
      if (bo.$instanceOf(customElement.extends) && bo.$attrs[`custom:${namespace}`]) {
        this.customElement = customElement
        return
      }
    }

    this.customElement = null
  }

  // Jira Issue Assignment Methods
  getElementTypeForSearch(): string {
    if (!this.customElement) return ""

    const typeMap: { [key: string]: string } = {
      "userStory:SubProcess": "userStory",
      "epic:SubProcess": "epic",
      "subtask:Task": "subtask",
    }

    return typeMap[this.customElement.type] || ""
  }

  getExpectedIssueTypes(): string {
    const elementType = this.getElementTypeForSearch()
    const typeMap: { [key: string]: string } = {
      epic: "Epic",
      userStory: "Story",
      subtask: "Sub-task and Task",
    }

    return typeMap[elementType] || "relevant"
  }

  getAssignedJiraIssue(): JiraIssueDto | null {
    if (!this.selectedElement) return null
    const bo = this.selectedElement.businessObject

    if (bo.$attrs["custom:epic"]) {
      return this.readEpicProperties(this.selectedElement)
    } else if (bo.$attrs["custom:userStory"]) {
      return this.readUserStoryProperties(this.selectedElement)
    } else if (bo.$attrs["custom:subtask"]) {
      return this.readSubtaskProperties(this.selectedElement)
    }
  }

  readEpicProperties(element: any): EpicDto | null {
    const bo = element.businessObject
    if (!bo["epicKey"]) {
      return null
    }
    return {
      key: bo["epicKey"],
      title: bo["epicTitle"],
      description: bo["epicDescription"] || "",
      status: bo["epicStatus"] || "",
      statusCategory: this.getStatusCategoryValue("epicStatus"),
      dueDate: bo["epicDueDate"] || "",
      progress: bo["epicProgress"] || 0,
      issueType: bo["epicIssueType"] || "Epic",
      url: bo["epicUrl"] || "",
    }
  }

  readUserStoryProperties(element: any): UserStoryDto | null {
    const bo = element.businessObject;
    if (!bo["userStoryKey"]) {
      return null
    }
    return {
      key: bo["userStoryKey"],
      title: bo["userStoryTitle"],
      description: bo["userStoryDescription"] || "",
      assignee: bo["userStoryAssignee"] || "",
      status: bo["userStoryStatus"] || "",
      statusCategory: this.getStatusCategoryValue("userStoryStatus"),
      priority: bo["userStoryPriority"] || "",
      dueDate: bo["userStoryDueDate"] || "",
      progress: bo["userStoryProgress"] || 0,
      issueType: bo["userStoryIssueType"] || "Story",
      url: bo["userStoryUrl"] || "",
    };
  }

  readSubtaskProperties(element: any): SubtaskDto | null {
    const bo = element.businessObject;
    if (!bo["subtaskKey"]) {
      return null
    }
    return {
      key: bo["subtaskKey"],
      title: bo["subtaskTitle"],
      description: bo["subtaskDescription"] || "",
      assignee: bo["subtaskAssignee"] || "",
      status: bo["subtaskStatus"] || "",
      statusCategory: this.getStatusCategoryValue("subtaskStatus"),
      priority: bo["subtaskPriority"] || "",
      dueDate: bo["subtaskDueDate"] || "",
      issueType: bo["subtaskIssueType"] || "Task",
      url: bo["subtaskUrl"] || "",
    };
  }

  onSearchInput(query = this.searchQuery): void {
    this.searchQuery = query
    this.searchSubject.next(this.searchQuery)
    if (this.searchQuery.length === 0) {
      this.showSearchResults = false
      this.searchResults = []
    }
  }

  onSearchFocus(): void {
    if (this.searchQuery.length >= 2) {
      this.showSearchResults = true
    }
  }

  onSearchBlur(): void {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      this.showSearchResults = false
    }, 200)
  }

  cancelSearch(): void {
    this.isSearching = false
    this.resetSearch()
  }

  resetSearch(): void {
    this.searchQuery = ""
    this.searchResults = []
    this.showSearchResults = false
    this.isLoading = false
    this.isSearching = false
  }

  selectJiraIssue(issue: JiraIssueDto): void {
    if (!this.selectedElement || !this.modeler || !this.isEditMode) {
      return
    }

    const element = this.selectedElement
    this.updateJiraElementProperties(element, issue)

    this.resetSearch()
  }

  removeJiraAssignment(): void {
    if (!this.selectedElement || !this.modeler || !this.isEditMode) {
      return
    }

    if (confirm("Are you sure you want to remove the Jira issue assignment?")) {
      const element = this.selectedElement
      const bo = this.selectedElement.businessObject

      let issueType;

      if (bo.$attrs["custom:epic"]) {
        issueType = "Epic"
      } else if (bo.$attrs["custom:userStory"]) {
        issueType = "Story"
      } else if (bo.$attrs["custom:subtask"]) {
        issueType = "Task"
      }

      this.updateJiraElementProperties(element, {
        key: "",
        title: "",
        description: "",
        assignee: "",
        status: "",
        statusCategory: "new",
        priority: "",
        dueDate: "",
        progress: 0,
        issueType: issueType,
        url: "",
      })
    }
  }

  openJiraIssue(issue: JiraIssueDto): void {
    if (issue.url) {
      window.open(issue.url, "_blank", "noopener,noreferrer")
    }
  }


  // Property organization methods
  getKeyProperties(): CustomProperty[] {
    if (!this.customElement) return []
    return this.customElement.properties.filter((prop) =>
      ["userStoryKey", "epicKey", "subtaskKey", "userStoryTitle", "epicTitle", "subtaskTitle"].includes(prop.name)
    )
  }

  getStatusProperties(): CustomProperty[] {
    if (!this.customElement) return []
    return this.customElement.properties.filter((prop) =>
      [
        "userStoryStatus", "epicStatus", "subtaskStatus",
        "userStoryPriority", "subtaskPriority",
        "userStoryProgress", "epicProgress"
      ].includes(prop.name)
    )
  }

  isProgressProperty(propName: string): boolean {
    if (!this.customElement) return false
    return [
      "userStoryProgress",
      "subtaskProgress",
      "epicProgress"
    ].includes(propName);
  }

  isUrlProperty(propName: string): boolean {
    return ["userStoryUrl", "epicUrl", "subtaskUrl"].includes(propName)
  }

  getAdditionalProperties(): CustomProperty[] {
    if (!this.customElement) return []
    return this.customElement.properties.filter(
      (prop) =>
        ![
          "userStoryKey", "epicKey", "subtaskKey",
          "userStoryTitle", "epicTitle", "subtaskTitle",
          "userStoryStatus", "epicStatus", "subtaskStatus",
          "userStoryStatusCategory", "epicStatusCategory", "subtaskStatusCategory",
          "userStoryPriority", "subtaskPriority",
          "userStoryProgress", "epicProgress",
          "userStoryIssueType", "epicIssueType", "subtaskIssueType"
        ].includes(prop.name)
    )
  }

  // Property display helpers
  getPropertyDisplayName(propName: string): string {
    const displayNames: { [key: string]: string } = {
      userStoryKey: "Key",
      epicKey: "Key",
      subtaskKey: "Key",
      userStoryTitle: "Title",
      epicTitle: "Title",
      subtaskTitle: "Title",
      userStoryDescription: "Description",
      epicDescription: "Description",
      subtaskDescription: "Description",
      userStoryAssignee: "Assignee",
      epicAssignee: "Assignee",
      subtaskAssignee: "Assignee",
      userStoryStatus: "Status",
      epicStatus: "Status",
      subtaskStatus: "Status",
      userStoryPriority: "Priority",
      subtaskPriority: "Priority",
      userStoryDueDate: "Due Date",
      epicDueDate: "Due Date",
      subtaskDueDate: "Due Date",
      userStoryProgress: "Progress",
      epicProgress: "Progress",
      userStoryIssueType: "Issue Type",
      epicIssueType: "Issue Type",
      subtaskIssueType: "Issue Type",
    }
    return displayNames[propName] || propName.charAt(0).toUpperCase() + propName.slice(1)
  }

  getPropertyPlaceholder(propName: string): string {
    const placeholders: { [key: string]: string } = {
      key: "e.g., PROJ-123",
      title: "Enter title...",
      description: "Enter description...",
      assignee: "Enter assignee name...",
      dueDate: "YYYY-MM-DD",
      progress: "0-100",
      total: "Number of items",
    }
    return placeholders[propName] || `Enter ${this.getPropertyDisplayName(propName)}...`
  }

  getFormattedPropertyValue(propName: string): string {
    const value = this.getPropertyValue(propName)
    const displayName = this.getPropertyDisplayName(propName)
    if (!value) return "Not set"

    switch (displayName) {
      case "Progress":
        return `${value}%`
      case "Due Date":
        // Format date if it's a valid date string
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString()
          }
        } catch (e) {
          // Fall through to return original value
        }
        return value
      case "total":
        return `${value} items`
      default:
        return value
    }
  }

  getPropertyValue(propName: string): any {
    if (!this.selectedElement || !this.customElement) {
      return ""
    }

    const bo = this.selectedElement.businessObject
    const value = bo[propName]
    if (value === undefined) {
      const propDef = this.customElement.properties.find((p) => p.name === propName)
      return propDef?.default !== undefined ? propDef.default : ""
    }

    return value
  }

  updateProperty(propName: string, event: Event, type = "string"): void {
    if (!this.selectedElement || !this.customElement || !this.modeler || !this.isEditMode) {
      return
    }

    const element = this.selectedElement
    let value: any
    if (type === "boolean") {
      value = (event.target as HTMLInputElement).checked ? "true" : "false"
    } else if (type === "integer") {
      value = Number.parseInt((event.target as HTMLInputElement).value, 10).toString()
    } else if (type === "float") {
      value = Number.parseFloat((event.target as HTMLInputElement).value).toString()
    } else {
      value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
    }

    const modeling = this.modeler.get("modeling");
    const propertyValueJson = {[`custom:${propName}`]: value};
    modeling.updateProperties(element, propertyValueJson);

    if (["userStoryTitle", "epicTitle", "subtaskTitle"].includes(propName)) {
      element.businessObject.name = value
    }

  }

  updatePropertyValue(propName: string, rawValue: any, type = "string"): void {
    if (!this.selectedElement || !this.customElement || !this.modeler || !this.isEditMode) {
      return
    }

    let value: any
    if (type === "boolean") {
      value = rawValue ? "true" : "false"
    } else if (type === "integer") {
      value = Number.parseInt(rawValue, 10).toString()
    } else if (type === "float" || type === "double") {
      value = Number.parseFloat(rawValue).toString()
    } else {
      value = rawValue
    }

    const updatedProperties: Record<string, any> = {[`custom:${propName}`]: value}
    const statusCategoryPropertyName = this.getStatusCategoryPropertyName(propName)
    if (statusCategoryPropertyName) {
      updatedProperties[`custom:${statusCategoryPropertyName}`] = getStatusCategoryForStatus(value)
    }

    const modeling = this.modeler.get("modeling")
    modeling.updateProperties(this.selectedElement, updatedProperties)

    if (["userStoryTitle", "epicTitle", "subtaskTitle"].includes(propName)) {
      this.selectedElement.businessObject.name = value
    }
  }

  updateJiraElementProperties(element: any, issue: JiraIssueDto): void {
    if (issue.issueType == "Epic") {
      this.updateEpicElementProperties(element, issue as EpicDto)
    } else if (issue.issueType == "Story") {
      this.updateStoryElementProperties(element, issue as UserStoryDto)
    } else if (issue.issueType == "Task") {
      this.updateSubtaskElementProperties(element, issue as SubtaskDto)
    }
  }

  updateEpicElementProperties(element: any, issue: EpicDto): void {
    if (!element || !element.businessObject || !this.modeler) return;
    const modeling = this.modeler.get("modeling");
    modeling.updateProperties(element, {
      "name": issue.title,
      "custom:epicKey": issue.key,
      "custom:epicTitle": issue.title,
      "custom:epicDescription": issue.description || "",
      "custom:epicStatus": issue.status || "",
      "custom:epicStatusCategory": this.resolveIssueStatusCategory(issue),
      "custom:epicDueDate": issue.dueDate || "",
      "custom:epicProgress": issue.progress || 0,
      "custom:epicIssueType": issue.issueType || "Epic",
      "custom:epicUrl": issue.url || "",
    });
  }

  updateStoryElementProperties(element: any, issue: UserStoryDto): void {
    if (!element || !element.businessObject || !this.modeler) return;
    const modeling = this.modeler.get("modeling");
    modeling.updateProperties(element, {
      "name": issue.title,
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
    });
  }

  updateSubtaskElementProperties(element: any, issue: SubtaskDto): void {
    if (!element || !element.businessObject || !this.modeler) return;
    const modeling = this.modeler.get("modeling");
    modeling.updateProperties(element, {
      "name": issue.title,
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
    });
  }

  roundProgress(value: number): number {
    return Math.round(value);
  }

  isStatusProperty(propName: string): boolean {
    return ["userStoryStatus", "epicStatus", "subtaskStatus"].includes(propName)
  }

  getStatusCategoryForStatus(status: string): string {
    return getStatusCategoryForStatus(status)
  }

  getStatusCategoryValue(statusPropertyName: string): string {
    const categoryPropertyName = this.getStatusCategoryPropertyName(statusPropertyName)
    if (!categoryPropertyName || !this.selectedElement) {
      return "new"
    }

    const bo = this.selectedElement.businessObject
    return normalizeStatusCategory(bo[categoryPropertyName] || getStatusCategoryForStatus(bo[statusPropertyName] || ""))
  }

  private getStatusCategoryPropertyName(statusPropertyName: string): string | null {
    const propertyNames: Record<string, string> = {
      userStoryStatus: "userStoryStatusCategory",
      epicStatus: "epicStatusCategory",
      subtaskStatus: "subtaskStatusCategory",
    }
    return propertyNames[statusPropertyName] || null
  }

  private resolveIssueStatusCategory(issue: JiraIssueDto): string {
    return issue.statusCategory ? normalizeStatusCategory(issue.statusCategory) : getStatusCategoryForStatus(issue.status || "")
  }
}
