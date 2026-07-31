import { Component, EventEmitter, Input, Output, ViewChild, type ElementRef } from "@angular/core"
import { NgIf, NgClass } from "@angular/common"
import { FormsModule } from "@angular/forms"

export interface NewProjectData {
  name: string
  importedFile?: File
}

@Component({
    selector: "app-create-project-dialog",
    imports: [NgIf, FormsModule],
    templateUrl: "./create-project-dialog.component.html",
    styleUrl: "./create-project-dialog.component.css"
})
export class CreateProjectDialogComponent {
  @Input() isOpen = false
  @Output() onClose = new EventEmitter<void>()
  @Output() onCreate = new EventEmitter<NewProjectData>()
  @Output() onOpenSettings = new EventEmitter<void>()

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>

  projectName = ""
  selectedFile: File | null = null
  isDragOver = false
  isCreating = false
  nameError = ""

  // File validation
  private readonly allowedExtensions = [".bpmn", ".xml"]
  private readonly maxFileSize = 10 * 1024 * 1024 // 10MB

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = true
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = false
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragOver = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      this.handleFileSelection(files[0])
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0])
    }
  }

  private handleFileSelection(file: File): void {
    // Validate file extension
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!this.allowedExtensions.includes(fileExtension)) {
      alert(`Please select a valid BPMN file (${this.allowedExtensions.join(", ")})`)
      return
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      alert("File size must be less than 10MB")
      return
    }

    this.selectedFile = file

    // Auto-fill project name if empty
    if (!this.projectName.trim()) {
      this.projectName = file.name.replace(/\.(bpmn|xml)$/i, "")
    }
  }

  removeFile(): void {
    this.selectedFile = null
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  selectFile(): void {
    this.fileInput?.nativeElement.click()
  }

  validateProjectName(): boolean {
    this.nameError = ""

    if (!this.projectName.trim()) {
      this.nameError = "Project name is required"
      return false
    }

    if (this.projectName.trim().length < 2) {
      this.nameError = "Project name must be at least 2 characters"
      return false
    }

    if (this.projectName.trim().length > 100) {
      this.nameError = "Project name must be less than 100 characters"
      return false
    }

    return true
  }

  onProjectNameChange(): void {
    if (this.nameError) {
      this.validateProjectName()
    }
  }

  onSubmit(): void {
    if (!this.validateProjectName() || this.isCreating) {
      return
    }

    this.isCreating = true

    const projectData: NewProjectData = {
      name: this.projectName.trim(),
      importedFile: this.selectedFile || undefined,
    }

    // Simulate creation delay for better UX
    setTimeout(() => {
      this.onCreate.emit(projectData)
      this.resetForm()
      this.isCreating = false
    }, 500)
  }

  onCancel(): void {
    this.resetForm()
    this.onClose.emit()
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel()
    }
  }

  openSettings(): void {
    this.onOpenSettings.emit()
  }

  private resetForm(): void {
    this.projectName = ""
    this.selectedFile = null
    this.nameError = ""
    this.isDragOver = false
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}
