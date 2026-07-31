export interface JiraIssueDto {
  key: string
  title: string
  description?: string
  assignee?: string
  status?: string
  statusCategory?: string
  priority?: string
  dueDate?: string
  progress?: number
  issueType?: string
  url?: string
}
