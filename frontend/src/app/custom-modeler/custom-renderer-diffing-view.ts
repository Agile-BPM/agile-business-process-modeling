import BaseRenderer from "diagram-js/lib/draw/BaseRenderer"
import {getStatusCategoryForStatus, normalizeStatusCategory, STATUS_CATEGORY_COLORS} from "../services/models/status-category"

const HIGH_PRIORITY = 1500

export default class CustomRendererDiffingView extends BaseRenderer {
  protected bpmnRenderer: any
  protected customElementsService: any
  protected elementRegistry: any

  constructor(eventBus: any, bpmnRenderer: any, customElementsService: any, elementRegistry: any) {
    super(eventBus, HIGH_PRIORITY)

    this.bpmnRenderer = bpmnRenderer
    this.customElementsService = customElementsService
    this.elementRegistry = elementRegistry
  }

  canRender(element: any): boolean {
    return this.getCustomElement(element) !== null
  }

  drawShape(parentNode: SVGElement, element: any): SVGElement | null {
    const customElement = this.getCustomElement(element)
    if (!customElement) {
      return null
    }

    if (customElement.type === "userStory:SubProcess") {
      return this.drawUserStory(parentNode, element, customElement)
    } else if (customElement.type === "epic:SubProcess") {
      return this.drawEpic(parentNode, element, customElement)
    } else if (customElement.type === "subtask:Task") {
      return this.drawSubtask(parentNode, element, customElement)
    }

    return this.bpmnRenderer.drawShape(parentNode, element)
  }

  private hasChangedFlag(element: any): boolean {
    // console.log(element)
    const businessObject = element.businessObject
    console.log("Checking changed flag: ", businessObject)
    console.log("has a changed flag: " , businessObject.$attrs["changed"])
    return !!(businessObject.$attrs["changed"] || businessObject.$attrs["added"] || businessObject.$attrs["removed"])
  }

  private getElementColors(element: any, defaultColors: any): any {
    if (this.hasChangedFlag(element)) {
      // Return original colors for changed elements
      return defaultColors
    } else {
      // Return greyscale colors for unchanged elements
      return {
        ...defaultColors,
        fill: "#f5f5f5",
        stroke: "#999999",
        headerFill: "#cccccc",
        textColor: "#666666",
        shadowColor: "rgba(0, 0, 0, 0.1)",
      }
    }
  }

  drawUserStory(parentNode: SVGElement, element: any, customElement: any): SVGElement {
    const { width, height } = element

    const defaultColors = {
      fill: "white",
      stroke: "rgb(90, 142, 46)",
      headerFill: "rgb(90, 142, 46)",
      textColor: "white",
      shadowColor: "rgba(0, 0, 0, 0.15)",
    }
    const colors = this.getElementColors(element, defaultColors)

    // Create the main group for the shape
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Add drop shadow filter
    const filterId = `drop-shadow-${element.id}`
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", filterId)
    filter.setAttribute("x", "-10%")
    filter.setAttribute("y", "-10%")
    filter.setAttribute("width", "120%")
    filter.setAttribute("height", "120%")

    const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow")
    feDropShadow.setAttribute("dx", "0")
    feDropShadow.setAttribute("dy", "1")
    feDropShadow.setAttribute("stdDeviation", "1")
    feDropShadow.setAttribute("flood-color", colors.shadowColor)
    filter.appendChild(feDropShadow)

    group.appendChild(filter)

    // Create the main rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", width.toString())
    rect.setAttribute("height", height.toString())
    rect.setAttribute("rx", "4")
    rect.setAttribute("ry", "4")
    rect.setAttribute("fill", colors.fill)
    rect.setAttribute("stroke", colors.stroke)
    rect.setAttribute("stroke-width", "1.5")
    rect.setAttribute("filter", `url(#${filterId})`)

    // Add a header bar
    const headerBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    headerBar.setAttribute("width", width.toString())
    headerBar.setAttribute("height", "20")
    headerBar.setAttribute("rx", "4")
    headerBar.setAttribute("ry", "4")
    headerBar.setAttribute("fill", colors.headerFill)

    // Create a clip path for the header
    const clipPathId = `header-clip-${element.id}`
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")
    clipPath.setAttribute("id", clipPathId)

    const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    clipRect.setAttribute("width", width.toString())
    clipRect.setAttribute("height", "20")
    clipRect.setAttribute("rx", "4")
    clipRect.setAttribute("ry", "4")
    clipPath.appendChild(clipRect)

    group.appendChild(clipPath)
    headerBar.setAttribute("clip-path", `url(#${clipPathId})`)

    // Add Bookmark Icon
    const bookmarkIconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    bookmarkIconGroup.setAttribute("transform", "translate(5, 4) scale(0.8)")

    const bookmarkIcon = document.createElementNS("http://www.w3.org/2000/svg", "path")
    bookmarkIcon.setAttribute(
      "d",
      "M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z",
    )
    bookmarkIcon.setAttribute("fill", colors.textColor)
    bookmarkIcon.setAttribute("transform", "scale(0.025, 0.025)")
    bookmarkIcon.setAttribute("stroke", colors.textColor)
    bookmarkIcon.setAttribute("stroke-width", "0.5")
    bookmarkIconGroup.appendChild(bookmarkIcon)

    // Add title text in header
    const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    titleText.setAttribute("x", "20")
    titleText.setAttribute("y", "12.5")
    titleText.setAttribute("font-size", "10")
    titleText.setAttribute("font-weight", "bold")
    titleText.setAttribute("fill", colors.textColor)
    titleText.textContent = "UserStory"

    // Add story ID badge
    const storyId = this.getStoryId(element)
    const storyIdBadgeWidth = this.getKeyBadgeWidth(storyId, 8, 40, 12)
    const storyIdBadge = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    storyIdBadge.setAttribute("x", (width - storyIdBadgeWidth - 5).toString())
    storyIdBadge.setAttribute("y", "4")
    storyIdBadge.setAttribute("width", storyIdBadgeWidth.toString())
    storyIdBadge.setAttribute("height", "12")
    storyIdBadge.setAttribute("rx", "6")
    storyIdBadge.setAttribute("fill", "rgba(255, 255, 255, 0.3)")

    const storyIdText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    storyIdText.setAttribute("x", (width - storyIdBadgeWidth / 2 - 5).toString())
    storyIdText.setAttribute("y", "13")
    storyIdText.setAttribute("font-size", "8")
    storyIdText.setAttribute("font-weight", "bold")
    storyIdText.setAttribute("fill", colors.textColor)
    storyIdText.setAttribute("text-anchor", "middle")
    storyIdText.textContent = storyId

    group.appendChild(rect)
    group.appendChild(headerBar)
    group.appendChild(bookmarkIconGroup)
    group.appendChild(titleText)
    group.appendChild(storyIdBadge)
    group.appendChild(storyIdText)

    // Add assignee in top left
    const assignee = this.getUserStoryAssignee(element)
    if (assignee) {
      const assigneeGroup = this.createAssigneeDisplay(assignee, width, 30, element.id + "-assignee")
      group.appendChild(assigneeGroup)
    }

    // Add multi-line title text in the center with left alignment
    const titleDisplayText = this.getUserStoryTitle(element)
    if (titleDisplayText) {
      const titleLines = this.wrapText(titleDisplayText, width - 30, 10)
      const maxLines = 2
      const linesToShow = titleLines.slice(0, maxLines)

      if (titleLines.length > maxLines) {
        const lastLine = linesToShow[maxLines - 1]
        const maxCharsInLastLine = Math.floor((width - 30) / 6) - 3
        linesToShow[maxLines - 1] =
          lastLine.length > maxCharsInLastLine ? lastLine.substring(0, maxCharsInLastLine) + "..." : lastLine + "..."
      }

      const startY = (height + 20) / 2 - linesToShow.length * 6 + 5
      linesToShow.forEach((line, index) => {
        const titleTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
        titleTextElement.setAttribute("x", "10")
        titleTextElement.setAttribute("y", (startY + index * 12).toString())
        titleTextElement.setAttribute("font-size", "10")
        titleTextElement.setAttribute("font-weight", "bold")
        titleTextElement.setAttribute("fill", "#333")
        titleTextElement.setAttribute("text-anchor", "start")
        titleTextElement.textContent = line

        group.appendChild(titleTextElement)
      })
    }

    // Add status badge at bottom left
    const status = this.getUserStoryStatus(element)
    if (status) {
      const statusBadge = this.createStatusBadge(
        status,
        this.getUserStoryStatusCategory(element),
        10,
        height - 18,
        element.id + "-status",
      )
      group.appendChild(statusBadge)
    }

    // Add priority badge at bottom right
    const priority = this.getUserStoryPriority(element)
    if (priority) {
      const priorityBadge = this.createPriorityBadge(priority, width - 10, height - 18, element.id + "-priority")
      group.appendChild(priorityBadge)
    }

    // Add progress bar below the card
    const progress = this.getUserStoryProgress(element)
    if (progress !== null && progress !== undefined) {
      const progressBar = this.createProgressBar(progress * 100, 0, height + 5, width, element.id + "-progress")
      group.appendChild(progressBar)
    }

    parentNode.appendChild(group)
    return group
  }

  drawSubtask(parentNode: SVGElement, element: any, customElement: any): SVGElement {
    const { width, height } = element

    const defaultColors = {
      fill: "white",
      stroke: "#0052CC",
      headerFill: "#0052CC",
      textColor: "white",
      shadowColor: "rgba(0, 0, 0, 0.2)",
    }
    const colors = this.getElementColors(element, defaultColors)

    // Create the main group for the shape
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Add drop shadow filter
    const filterId = `drop-shadow-${element.id}`
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", filterId)
    filter.setAttribute("x", "-10%")
    filter.setAttribute("y", "-10%")
    filter.setAttribute("width", "120%")
    filter.setAttribute("height", "120%")

    const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow")
    feDropShadow.setAttribute("dx", "0")
    feDropShadow.setAttribute("dy", "2")
    feDropShadow.setAttribute("stdDeviation", "2")
    feDropShadow.setAttribute("flood-color", colors.shadowColor)
    filter.appendChild(feDropShadow)

    group.appendChild(filter)

    // Create the main rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", width.toString())
    rect.setAttribute("height", height.toString())
    rect.setAttribute("rx", "6")
    rect.setAttribute("ry", "6")
    rect.setAttribute("fill", colors.fill)
    rect.setAttribute("stroke", colors.stroke)
    rect.setAttribute("stroke-width", "1.5")
    rect.setAttribute("filter", `url(#${filterId})`)

    // Add a header bar
    const headerBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    headerBar.setAttribute("width", width.toString())
    headerBar.setAttribute("height", "24")
    headerBar.setAttribute("rx", "6")
    headerBar.setAttribute("ry", "6")
    headerBar.setAttribute("fill", colors.headerFill)

    // Create a clip path for the header
    const clipPathId = `header-clip-${element.id}`
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")
    clipPath.setAttribute("id", clipPathId)

    const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    clipRect.setAttribute("width", width.toString())
    clipRect.setAttribute("height", "24")
    clipRect.setAttribute("rx", "6")
    clipRect.setAttribute("ry", "6")
    clipPath.appendChild(clipRect)

    group.appendChild(clipPath)
    headerBar.setAttribute("clip-path", `url(#${clipPathId})`)

    // Add subtask icon
    const subtaskIconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    subtaskIconGroup.setAttribute("transform", "translate(7, 5)")

    const subtaskIcon = document.createElementNS("http://www.w3.org/2000/svg", "path")
    subtaskIcon.setAttribute(
      "d",
      "M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z",
    )
    subtaskIcon.setAttribute("fill", colors.textColor)
    subtaskIcon.setAttribute("transform", "scale(0.025, 0.025)")
    subtaskIcon.setAttribute("stroke", colors.textColor)
    subtaskIcon.setAttribute("stroke-width", "0.5")
    subtaskIconGroup.appendChild(subtaskIcon)

    // Add title text in header
    const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    titleText.setAttribute("x", "25")
    titleText.setAttribute("y", "15")
    titleText.setAttribute("font-size", "10")
    titleText.setAttribute("font-weight", "bold")
    titleText.setAttribute("fill", colors.textColor)
    titleText.textContent = "Task"

    // Add subtask ID badge
    const subtaskId = this.getSubtaskId(element)
    const subtaskIdBadgeWidth = this.getKeyBadgeWidth(subtaskId, 10, 50, 14)
    const subtaskIdBadge = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    subtaskIdBadge.setAttribute("x", (width - subtaskIdBadgeWidth - 5).toString())
    subtaskIdBadge.setAttribute("y", "4")
    subtaskIdBadge.setAttribute("width", subtaskIdBadgeWidth.toString())
    subtaskIdBadge.setAttribute("height", "16")
    subtaskIdBadge.setAttribute("rx", "8")
    subtaskIdBadge.setAttribute("fill", "rgba(255, 255, 255, 0.3)")

    const subtaskIdText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    subtaskIdText.setAttribute("x", (width - subtaskIdBadgeWidth / 2 - 5).toString())
    subtaskIdText.setAttribute("y", "16")
    subtaskIdText.setAttribute("font-size", "10")
    subtaskIdText.setAttribute("font-weight", "bold")
    subtaskIdText.setAttribute("fill", colors.textColor)
    subtaskIdText.setAttribute("text-anchor", "middle")
    subtaskIdText.textContent = subtaskId

    group.appendChild(rect)
    group.appendChild(headerBar)
    group.appendChild(subtaskIconGroup)
    group.appendChild(titleText)
    group.appendChild(subtaskIdBadge)
    group.appendChild(subtaskIdText)

    const assignee = this.getSubtaskAssignee(element)
    if (assignee) {
      const assigneeGroup = this.createAssigneeDisplay(assignee, width, 34, element.id + "-assignee")
      group.appendChild(assigneeGroup)
    }

    const titleDisplayText = this.getSubtaskTitle(element)
    if (titleDisplayText) {
      const titleLines = this.wrapText(titleDisplayText, width - 30, 10)
      const maxLines = 2
      const linesToShow = titleLines.slice(0, maxLines)

      if (titleLines.length > maxLines) {
        const lastLine = linesToShow[maxLines - 1]
        const maxCharsInLastLine = Math.floor((width - 30) / 6) - 3
        linesToShow[maxLines - 1] =
          lastLine.length > maxCharsInLastLine ? lastLine.substring(0, maxCharsInLastLine) + "..." : lastLine + "..."
      }

      const startY = (height + 24) / 2 - linesToShow.length * 6 + 5
      linesToShow.forEach((line, index) => {
        const titleTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
        titleTextElement.setAttribute("x", "10")
        titleTextElement.setAttribute("y", (startY + index * 12).toString())
        titleTextElement.setAttribute("font-size", "10")
        titleTextElement.setAttribute("font-weight", "bold")
        titleTextElement.setAttribute("fill", "#333")
        titleTextElement.setAttribute("text-anchor", "start")
        titleTextElement.textContent = line

        group.appendChild(titleTextElement)
      })
    }

    // Add status badge at bottom left
    const status = this.getSubtaskStatus(element)
    if (status) {
      const statusBadge = this.createStatusBadge(
        status,
        this.getSubtaskStatusCategory(element),
        10,
        height - 18,
        element.id + "-status",
      )
      group.appendChild(statusBadge)
    }

    // Add priority badge at bottom right
    const priority = this.getSubtaskPriority(element)
    if (priority) {
      const priorityBadge = this.createPriorityBadge(priority, width - 10, height - 18, element.id + "-priority")
      group.appendChild(priorityBadge)
    }

    parentNode.appendChild(group)
    return group
  }

  createAssigneeDisplay(assignee: string, cardWidth: number, y: number, id: string): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Use assignee name as-is
    const displayName = assignee.trim()

    // Estimate text width (approximately 5px per character for 8px font)
    const textWidth = displayName.length * 5
    const iconSize = 12 // Profile icon size
    const spacing = 4 // Space between icon and text
    const totalWidth = iconSize + spacing + textWidth
    const padding = 10 // Padding from card edge

    // Ensure the assignee display fits within the card
    const maxWidth = cardWidth - padding * 2
    let finalDisplayName = displayName
    let finalTextWidth = textWidth

    // If the total width exceeds the available space, truncate the name
    if (totalWidth > maxWidth) {
      const availableTextWidth = maxWidth - iconSize - spacing
      const maxChars = Math.floor(availableTextWidth / 5) - 3 // Reserve space for "..."
      if (maxChars > 0) {
        finalDisplayName = displayName.substring(0, maxChars) + "..."
        finalTextWidth = finalDisplayName.length * 5
      } else {
        // If even truncated text won't fit, just show the icon
        finalDisplayName = ""
        finalTextWidth = 0
      }
    }

    // Position from the left edge with padding
    const iconX = padding
    const textX = iconX + iconSize + spacing

    // Create profile icon using the new SVG
    const profileIconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    profileIconGroup.setAttribute("transform", `translate(${iconX}, ${y - iconSize / 2}) scale(0.375, 0.375)`)

    // Outer circle
    const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    outerCircle.setAttribute("cx", "16")
    outerCircle.setAttribute("cy", "16")
    outerCircle.setAttribute("r", "15")
    outerCircle.setAttribute("fill", "none")
    outerCircle.setAttribute("stroke", "#666")
    outerCircle.setAttribute("stroke-width", "2")
    outerCircle.setAttribute("stroke-linejoin", "round")
    outerCircle.setAttribute("stroke-miterlimit", "10")

    // Body path
    const bodyPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    bodyPath.setAttribute("d", "M26,27L26,27 c0-5.523-4.477-10-10-10h0c-5.523,0-10,4.477-10,10v0")
    bodyPath.setAttribute("fill", "none")
    bodyPath.setAttribute("stroke", "#666")
    bodyPath.setAttribute("stroke-width", "2")
    bodyPath.setAttribute("stroke-linejoin", "round")
    bodyPath.setAttribute("stroke-miterlimit", "10")

    // Head circle
    const headCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    headCircle.setAttribute("cx", "16")
    headCircle.setAttribute("cy", "11")
    headCircle.setAttribute("r", "6")
    headCircle.setAttribute("fill", "none")
    headCircle.setAttribute("stroke", "#666")
    headCircle.setAttribute("stroke-width", "2")
    headCircle.setAttribute("stroke-linejoin", "round")
    headCircle.setAttribute("stroke-miterlimit", "10")

    profileIconGroup.appendChild(outerCircle)
    profileIconGroup.appendChild(bodyPath)
    profileIconGroup.appendChild(headCircle)

    group.appendChild(profileIconGroup)

    // Create assignee text only if there's a name to display
    if (finalDisplayName) {
      const assigneeText = document.createElementNS("http://www.w3.org/2000/svg", "text")
      assigneeText.setAttribute("x", textX.toString())
      assigneeText.setAttribute("y", (y + 1).toString())
      assigneeText.setAttribute("font-size", "8")
      assigneeText.setAttribute("font-weight", "400")
      assigneeText.setAttribute("fill", "#666")
      assigneeText.setAttribute("text-anchor", "start")
      assigneeText.setAttribute("dominant-baseline", "middle")
      assigneeText.textContent = finalDisplayName

      group.appendChild(assigneeText)
    }

    return group
  }

  formatAssigneeName(fullName: string): string {
    // Removed - no longer needed, using assignee name as-is
    return fullName.trim()
  }

  private getKeyBadgeWidth(key: string, fontSize: number, minWidth: number, horizontalPadding: number): number {
    return Math.max(key.length * fontSize * 0.6 + horizontalPadding, minWidth)
  }

  createStatusBadge(status: string, statusCategory: string, x: number, y: number, id: string): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    const textLength = status.length
    const badgeWidth = Math.max(textLength * 5 + 12, 40)
    const badgeHeight = 12

    const badge = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    badge.setAttribute("x", x.toString())
    badge.setAttribute("y", y.toString())
    badge.setAttribute("width", badgeWidth.toString())
    badge.setAttribute("height", badgeHeight.toString())
    badge.setAttribute("rx", "6")
    badge.setAttribute("ry", "6")

    const elementId = id.replace("-status", "")
    const parentElement = this.elementRegistry.get(elementId)
    const isElementChanged = parentElement ? this.hasChangedFlag(parentElement) : true

    const statusColors = isElementChanged ? this.getStatusColors(statusCategory) : this.getGreyedStatusColors(statusCategory)
    badge.setAttribute("fill", statusColors.background)
    badge.setAttribute("stroke", statusColors.border)
    badge.setAttribute("stroke-width", "1")

    const statusText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    statusText.setAttribute("x", (x + badgeWidth / 2).toString())
    statusText.setAttribute("y", (y + badgeHeight / 2).toString())
    statusText.setAttribute("font-size", "7")
    statusText.setAttribute("font-weight", "600")
    statusText.setAttribute("fill", statusColors.text)
    statusText.setAttribute("text-anchor", "middle")
    statusText.setAttribute("dominant-baseline", "central")
    statusText.textContent = status.toUpperCase()

    group.appendChild(badge)
    group.appendChild(statusText)

    return group
  }

  createPriorityBadge(priority: string, x: number, y: number, id: string): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    const textLength = priority.length
    const badgeWidth = Math.max(textLength * 5 + 12, 35)
    const badgeHeight = 12

    const badge = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    badge.setAttribute("x", (x - badgeWidth).toString())
    badge.setAttribute("y", y.toString())
    badge.setAttribute("width", badgeWidth.toString())
    badge.setAttribute("height", badgeHeight.toString())
    badge.setAttribute("rx", "6")
    badge.setAttribute("ry", "6")

    const elementId = id.replace("-priority", "")
    const parentElement = this.elementRegistry.get(elementId)
    const isElementChanged = parentElement ? this.hasChangedFlag(parentElement) : true

    const priorityColors = isElementChanged ? this.getPriorityColors(priority) : this.getGreyedPriorityColors(priority)
    badge.setAttribute("fill", priorityColors.background)
    badge.setAttribute("stroke", priorityColors.border)
    badge.setAttribute("stroke-width", "1")

    const priorityText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    priorityText.setAttribute("x", (x - badgeWidth / 2).toString())
    priorityText.setAttribute("y", (y + badgeHeight / 2).toString())
    priorityText.setAttribute("font-size", "7")
    priorityText.setAttribute("font-weight", "600")
    priorityText.setAttribute("fill", priorityColors.text)
    priorityText.setAttribute("text-anchor", "middle")
    priorityText.setAttribute("dominant-baseline", "central")
    priorityText.textContent = priority.toUpperCase()

    group.appendChild(badge)
    group.appendChild(priorityText)

    return group
  }

  createProgressBar(progress: number, x: number, y: number, width: number, id: string): SVGElement {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    const barHeight = 4
    const barWidth = width - 20 // Leave some margin
    const barX = x + 10

    const elementId = id.replace("-progress", "")
    const element = this.elementRegistry.get(elementId)
    const isUnchanged = element && !this.hasChangedFlag(element)

    // Background bar
    const backgroundBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    backgroundBar.setAttribute("x", barX.toString())
    backgroundBar.setAttribute("y", y.toString())
    backgroundBar.setAttribute("width", barWidth.toString())
    backgroundBar.setAttribute("height", barHeight.toString())
    backgroundBar.setAttribute("rx", "2")
    backgroundBar.setAttribute("ry", "2")
    backgroundBar.setAttribute("fill", isUnchanged ? "#f0f0f0" : "#e0e0e0")

    // Progress bar
    const progressWidth = (barWidth * Math.min(Math.max(progress, 0), 100)) / 100
    const progressBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    progressBar.setAttribute("x", barX.toString())
    progressBar.setAttribute("y", y.toString())
    progressBar.setAttribute("width", progressWidth.toString())
    progressBar.setAttribute("height", barHeight.toString())
    progressBar.setAttribute("rx", "2")
    progressBar.setAttribute("ry", "2")

    let progressColor = "#4caf50" // Green for high progress
    if (progress < 30) {
      progressColor = "#f44336" // Red for low progress
    } else if (progress < 70) {
      progressColor = "#ff9800" // Orange for medium progress
    }

    // Grey out progress bar color for unchanged elements
    if (isUnchanged) {
      progressColor = "#c0c0c0"
    }

    progressBar.setAttribute("fill", progressColor)

    // Progress text
    const progressText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    progressText.setAttribute("x", (barX + barWidth / 2).toString())
    progressText.setAttribute("y", (y + barHeight + 12).toString())
    progressText.setAttribute("font-size", "8")
    progressText.setAttribute("font-weight", "500")
    progressText.setAttribute("fill", isUnchanged ? "#999" : "#666")
    progressText.setAttribute("text-anchor", "middle")
    progressText.textContent = `${Math.round(progress)}%`

    group.appendChild(backgroundBar)
    group.appendChild(progressBar)
    group.appendChild(progressText)

    return group
  }

  drawEpic(parentNode: SVGElement, element: any, customElement: any): SVGElement {
    const { width, height } = element

    const defaultColors = {
      fill: "#F3E5F5",
      stroke: "#673AB7",
      headerFill: "#673AB7",
      textColor: "white",
      shadowColor: "rgba(103, 58, 183, 0.3)",
    }
    const colors = this.getElementColors(element, defaultColors)

    // Create the main group for the shape
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Add drop shadow filter
    const filterId = `drop-shadow-${element.id}`
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
    filter.setAttribute("id", filterId)
    filter.setAttribute("x", "-10%")
    filter.setAttribute("y", "-10%")
    filter.setAttribute("width", "120%")
    filter.setAttribute("height", "120%")

    const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow")
    feDropShadow.setAttribute("dx", "0")
    feDropShadow.setAttribute("dy", "3")
    feDropShadow.setAttribute("stdDeviation", "4")
    feDropShadow.setAttribute("flood-color", colors.shadowColor)
    filter.appendChild(feDropShadow)

    group.appendChild(filter)

    // Create the main rectangle with rounded corners (expanded subprocess container)
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", width.toString())
    rect.setAttribute("height", height.toString())
    rect.setAttribute("rx", "8")
    rect.setAttribute("ry", "8")
    rect.setAttribute("fill", colors.fill)
    rect.setAttribute("stroke", colors.stroke)
    rect.setAttribute("stroke-width", "2")
    rect.setAttribute("stroke-dasharray", "8,4")
    rect.setAttribute("filter", `url(#${filterId})`)

    // Add a header bar
    const headerBar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    headerBar.setAttribute("width", width.toString())
    headerBar.setAttribute("height", "36")
    headerBar.setAttribute("rx", "8")
    headerBar.setAttribute("ry", "8")
    headerBar.setAttribute("fill", colors.headerFill)

    // Create a clip path for the header
    const clipPathId = `header-clip-${element.id}`
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")
    clipPath.setAttribute("id", clipPathId)

    const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    clipRect.setAttribute("width", width.toString())
    clipRect.setAttribute("height", "36")
    clipRect.setAttribute("rx", "8")
    clipRect.setAttribute("ry", "8")
    clipPath.appendChild(clipRect)

    group.appendChild(clipPath)
    headerBar.setAttribute("clip-path", `url(#${clipPathId})`)

    // Add epic icon
    const epicIconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    epicIconGroup.setAttribute("transform", "translate(12, 10)")
    const epicIcon = document.createElementNS("http://www.w3.org/2000/svg", "path")
    epicIcon.setAttribute(
      "d",
      "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z",
    )
    epicIcon.setAttribute("fill", colors.textColor)
    epicIcon.setAttribute("transform", "scale(0.03, 0.03)")
    epicIcon.setAttribute("stroke", colors.textColor)
    epicIcon.setAttribute("stroke-width", "0.5")
    epicIconGroup.appendChild(epicIcon)

    // Get the epic title for display in header
    const epicTitle = this.getEpicTitle(element)
    const epicId = this.getEpicId(element)
    const epicIdBadgeWidth = this.getKeyBadgeWidth(epicId, 11, 65, 18)

    // Add epic title text in header next to the lightning icon
    const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    titleText.setAttribute("x", "35")
    titleText.setAttribute("y", "24")
    titleText.setAttribute("font-size", "13")
    titleText.setAttribute("font-weight", "600")
    titleText.setAttribute("fill", colors.textColor)

    // Calculate available space for title (total width minus icon space and ID badge space)
    const availableWidth = Math.max(0, width - 35 - epicIdBadgeWidth - 20) // 35 for icon space, 20 for spacing/margins
    const maxTitleLength = Math.floor(availableWidth / 7) // Approximately 7px per character

    let displayTitle = epicTitle
    if (epicTitle && maxTitleLength <= 3) {
      displayTitle = ""
    } else if (epicTitle && epicTitle.length > maxTitleLength) {
      displayTitle = epicTitle.substring(0, maxTitleLength - 3) + "..."
    }

    titleText.textContent = displayTitle || "Epic"

    // Add epic ID badge
    const epicIdBadge = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    epicIdBadge.setAttribute("x", (width - epicIdBadgeWidth - 10).toString())
    epicIdBadge.setAttribute("y", "10")
    epicIdBadge.setAttribute("width", epicIdBadgeWidth.toString())
    epicIdBadge.setAttribute("height", "16")
    epicIdBadge.setAttribute("rx", "12")
    epicIdBadge.setAttribute("fill", "rgba(255, 255, 255, 0.25)")
    epicIdBadge.setAttribute("stroke", "rgba(255, 255, 255, 0.4)")
    epicIdBadge.setAttribute("stroke-width", "1")

    const epicIdText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    epicIdText.setAttribute("x", (width - epicIdBadgeWidth / 2 - 10).toString())
    epicIdText.setAttribute("y", "21")
    epicIdText.setAttribute("font-size", "11")
    epicIdText.setAttribute("font-weight", "500")
    epicIdText.setAttribute("fill", colors.textColor)
    epicIdText.setAttribute("text-anchor", "middle")
    epicIdText.textContent = epicId

    // Add subtle gradient overlay for depth
    const gradientId = `epic-gradient-${element.id}`
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
    gradient.setAttribute("id", gradientId)
    gradient.setAttribute("x1", "0%")
    gradient.setAttribute("y1", "0%")
    gradient.setAttribute("x2", "0%")
    gradient.setAttribute("y2", "100%")

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop1.setAttribute("offset", "0%")
    stop1.setAttribute("stop-color", "rgba(255, 255, 255, 0.1)")

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop2.setAttribute("offset", "100%")
    stop2.setAttribute("stop-color", "rgba(103, 58, 183, 0.05)")

    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    group.appendChild(gradient)

    const gradientOverlay = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    gradientOverlay.setAttribute("x", "2")
    gradientOverlay.setAttribute("y", "36")
    gradientOverlay.setAttribute("width", (width - 4).toString())
    gradientOverlay.setAttribute("height", (height - 38).toString())
    gradientOverlay.setAttribute("rx", "6")
    gradientOverlay.setAttribute("ry", "6")
    gradientOverlay.setAttribute("fill", `url(#${gradientId})`)

    // Add all elements to the group in the correct order
    group.appendChild(rect)
    group.appendChild(gradientOverlay)
    group.appendChild(headerBar)
    group.appendChild(epicIconGroup)
    group.appendChild(titleText)
    group.appendChild(epicIdBadge)
    group.appendChild(epicIdText)

    // Add progress bar below the card
    const progress = this.getEpicProgress(element)
    if (progress !== null && progress !== undefined) {
      const progressBar = this.createProgressBar(progress * 100, 0, height + 5, width, element.id + "-progress")
      group.appendChild(progressBar)
    }

    parentNode.appendChild(group)
    return group
  }

  getEpicId(element: any): string {
    const bo = element.businessObject
    return bo["epicKey"] || "None"
  }

  getEpicTitle(element: any): string {
    const bo = element.businessObject
    return bo["epicTitle"] || ""
  }

  getEpicProgress(element: any): number {
    const bo = element.businessObject
    return bo["epicProgress"] || 0
  }

  getSubtaskId(element: any): string {
    const bo = element.businessObject
    return bo["subtaskKey"] || "None"
  }

  getStoryId(element: any): string {
    const bo = element.businessObject
    return bo["userStoryKey"] || "None"
  }

  getCustomElement(element: any): any {
    if (!element || !element.businessObject) {
      return null
    }

    const bo = element.businessObject
    const customElements = this.customElementsService.getCustomElements()

    for (const customElement of customElements) {
      const [namespace, type] = customElement.type.split(":")
      if (bo.$attrs[`custom:${namespace}`]) {
        return customElement
      }
    }
    return null
  }

  getTitleText(element: any, elementType: string): string {
    if (!element || !element.businessObject) {
      return ""
    }

    const bo = element.businessObject
    let title = ""
    let maxLength = 0

    // Get title and set max length based on element type and size
    switch (elementType) {
      case "epic":
        title = bo["epicTitle"] || ""
        maxLength = Math.floor(element.width / 8) // Approximately 8px per character
        break
      case "userStory":
        title = bo["userStoryTitle"] || ""
        maxLength = Math.floor(element.width / 7) // Approximately 7px per character
        break
      case "subtask":
        title = bo["subtaskTitle"] || ""
        maxLength = Math.floor(element.width / 6) // Approximately 6px per character for smaller font
        break
      default:
        return ""
    }

    if (!title) {
      return ""
    }

    // Truncate text if it's too long
    if (title.length > maxLength) {
      return title.substring(0, maxLength - 3) + "..."
    }

    return title
  }

  wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    // Approximate character width based on font size
    const charWidth = fontSize * 0.6
    const maxCharsPerLine = Math.floor(maxWidth / charWidth)

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word

      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Word is too long, break it
          lines.push(word.substring(0, maxCharsPerLine))
          currentLine = word.substring(maxCharsPerLine)
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  getUserStoryTitle(element: any): string {
    const bo = element.businessObject
    return bo["userStoryTitle"] || ""
  }

  getUserStoryStatus(element: any): string {
    const bo = element.businessObject
    return bo["userStoryStatus"] || ""
  }

  getUserStoryStatusCategory(element: any): string {
    const bo = element.businessObject
    return bo["userStoryStatusCategory"] || getStatusCategoryForStatus(bo["userStoryStatus"] || "")
  }

  getUserStoryAssignee(element: any): string {
    const bo = element.businessObject
    return bo["userStoryAssignee"] || "Unassigned"
  }

  getUserStoryPriority(element: any): string {
    const bo = element.businessObject
    return bo["userStoryPriority"] || ""
  }

  getUserStoryProgress(element: any): number {
    const bo = element.businessObject
    return bo["userStoryProgress"] || 0
  }

  getSubtaskTitle(element: any): string {
    const bo = element.businessObject
    return bo["subtaskTitle"] || ""
  }

  getSubtaskStatus(element: any): string {
    const bo = element.businessObject
    return bo["subtaskStatus"] || ""
  }

  getSubtaskStatusCategory(element: any): string {
    const bo = element.businessObject
    return bo["subtaskStatusCategory"] || getStatusCategoryForStatus(bo["subtaskStatus"] || "")
  }

  getSubtaskAssignee(element: any): string {
    const bo = element.businessObject
    return bo["subtaskAssignee"] || "Unassigned"
  }

  getSubtaskPriority(element: any): string {
    const bo = element.businessObject
    return bo["subtaskPriority"] || ""
  }

  getGreyedStatusColors(status: string): { background: string; border: string; text: string } {
    return {
      background: "#f5f5f5",
      border: "#cccccc",
      text: "#999999",
    }
  }

  getGreyedPriorityColors(priority: string): { background: string; border: string; text: string } {
    return {
      background: "#f5f5f5",
      border: "#cccccc",
      text: "#999999",
    }
  }

  getPriorityColors(priority: string): { background: string; border: string; text: string } {
    const normalizedPriority = priority.toLowerCase()

    if (normalizedPriority.includes("critical") || normalizedPriority.includes("highest")) {
      return {
        background: "#ffebee",
        border: "#ef5350",
        text: "#c62828",
      }
    }

    if (normalizedPriority.includes("high")) {
      return {
        background: "#fff3e0",
        border: "#ff9800",
        text: "#e65100",
      }
    }

    if (normalizedPriority.includes("medium") || normalizedPriority.includes("normal")) {
      return {
        background: "#e3f2fd",
        border: "#2196f3",
        text: "#1565c0",
      }
    }

    if (normalizedPriority.includes("low") || normalizedPriority.includes("lowest")) {
      return {
        background: "#e8f5e8",
        border: "#4caf50",
        text: "#2e7d32",
      }
    }

    // Default
    return {
      background: "#f5f5f5",
      border: "#bdbdbd",
      text: "#757575",
    }
  }

  getStatusColors(statusCategory: string): { background: string; border: string; text: string } {
    return STATUS_CATEGORY_COLORS[normalizeStatusCategory(statusCategory)]
  }
}
