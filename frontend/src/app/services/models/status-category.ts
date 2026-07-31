export type StatusCategoryKey = "new" | "indeterminate" | "done"

export interface StatusCategoryColors {
  background: string
  border: string
  text: string
}

export const STATUS_CATEGORY_COLORS: Record<StatusCategoryKey, StatusCategoryColors> = {
  new: {
    background: "#f5f5f5",
    border: "#e0e0e0",
    text: "#666",
  },
  indeterminate: {
    background: "#e3f2fd",
    border: "#bbdefb",
    text: "#1976d2",
  },
  done: {
    background: "#e8f5e8",
    border: "#a5d6a7",
    text: "#2e7d32",
  },
}

export function getStatusCategoryForStatus(status: string): StatusCategoryKey {
  switch (status) {
    case "Backlog":
    case "Planning":
    case "To Do":
    case "Zu erledigen":
    case "Ready":
      return "new"
    case "Done":
    case "Fertig":
    case "Cancelled":
      return "done"
    default:
      return "indeterminate"
  }
}

export function normalizeStatusCategory(category?: string): StatusCategoryKey {
  if (category === "new" || category === "indeterminate" || category === "done") {
    return category
  }
  return "new"
}
