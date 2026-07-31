// Custom BPMN elements and properties definitions
export interface CustomProperty {
  name: string
  type: "string" | "boolean" | "integer" | "float" | "enum" | "double"
  default?: any
  isRequired?: boolean
  enumValues?: string[]
  description?: string
}

export interface CustomElement {
  type: string
  extends: string
  properties: CustomProperty[]
  label: string
  description?: string
}

// Default custom elements
export const DEFAULT_CUSTOM_ELEMENTS: CustomElement[] = [
  {
    type: "userStory:SubProcess",
    extends: "bpmn:SubProcess",
    label: "User Story",
    description: "An agile user story representing a feature from the user's perspective",
    properties: [
      {
        name: "userStoryKey",
        type: "string",
        isRequired: true,
        description: "The unique key/identifier of the user story",
      },
      {
        name: "userStoryTitle",
        type: "string",
        isRequired: true,
        description: "The title of the user story",
      },
      {
        name: "userStoryDescription",
        type: "string",
        description: "Detailed description of the user story",
      },
      {
        name: "userStoryAssignee",
        type: "string",
        description: "Person assigned to this user story",
      },
      {
        name: "userStoryStatus",
        type: "enum",
        enumValues: ["Backlog", "Ready", "In Progress", "Testing", "Done"],
        description: "Current status of the user story",
      },
      {
        name: "userStoryStatusCategory",
        type: "string",
        default: "new",
        description: "Status category for the user story",
      },
      {
        name: "userStoryPriority",
        type: "enum",
        enumValues: ["Low", "Medium", "High", "Critical"],
        description: "Priority of the user story",
      },
      {
        name: "userStoryDueDate",
        type: "string",
        description: "Due date for the user story (YYYY-MM-DD)",
      },
      {
        name: "userStoryProgress",
        type: "double",
        default: 0,
        description: "Progress percentage (0-100)",
      },
      {
        name: "userStoryIssueType",
        type: "string",
        default: "Story",
        description: "Type of the issue (e.g., Epic, Story, Task)",
      },
      {
        name: "userStoryUrl",
        type: "string",
        description: "URL to the user story in the issue tracker",
      }
    ],
  },
  {
    type: "epic:SubProcess",
    extends: "bpmn:SubProcess",
    label: "Epic",
    description: "A large body of work that can be broken down into smaller user stories",
    properties: [
      {
        name: "epicKey",
        type: "string",
        isRequired: true,
        description: "The unique key/identifier of the epic",
      },
      {
        name: "epicTitle",
        type: "string",
        isRequired: true,
        description: "The title of the epic",
      },
      {
        name: "epicDescription",
        type: "string",
        description: "Detailed description of the epic",
      },
      {
        name: "epicStatus",
        type: "enum",
        enumValues: ["Planning", "In Progress", "Review", "Done", "Cancelled"],
        description: "Current status of the epic",
      },
      {
        name: "epicStatusCategory",
        type: "string",
        default: "new",
        description: "Status category for the epic",
      },
      {
        name: "epicDueDate",
        type: "string",
        description: "Due date for the epic (YYYY-MM-DD)",
      },
      {
        name: "epicProgress",
        type: "double",
        default: 0,
        description: "Progress percentage (0-100)",
      },
      {
        name: "epicIssueType",
        type: "string",
        default: "Epic",
        description: "Type of the issue (e.g., Epic, Story, Task)",
      },
      {
        name: "epicUrl",
        type: "string",
        description: "URL to the epic in the issue tracker",
      }
    ],
  },
  {
    type: "subtask:Task",
    extends: "bpmn:Task",
    label: "Task",
    description: "A smaller task that is part of a larger user story or epic",
    properties: [
      {
        name: "subtaskKey",
        type: "string",
        isRequired: true,
        description: "The unique key/identifier of the task",
      },
      {
        name: "subtaskTitle",
        type: "string",
        isRequired: true,
        description: "The title of the task",
      },
      {
        name: "subtaskDescription",
        type: "string",
        description: "Detailed description of the task",
      },
      {
        name: "subtaskAssignee",
        type: "string",
        description: "Person assigned to this task",
      },
      {
        name: "subtaskStatus",
        type: "enum",
        enumValues: ["To Do", "In Progress", "Code Review", "Testing", "Done"],
        description: "Current status of the task",
      },
      {
        name: "subtaskStatusCategory",
        type: "string",
        default: "new",
        description: "Status category for the task",
      },
      {
        name: "subtaskPriority",
        type: "enum",
        enumValues: ["Low", "Medium", "High", "Critical"],
        description: "Priority of the task",
      },
      {
        name: "subtaskDueDate",
        type: "string",
        description: "Due date for the task (YYYY-MM-DD)",
      },
      {
        name: "subtaskIssueType",
        type: "string",
        default: "Task",
        description: "Type of the issue (e.g., Epic, Story, Task)",
      },
      {
        name: "subtaskUrl",
        type: "string",
        description: "URL to the task in the issue tracker",
      }
    ],
  },
]
