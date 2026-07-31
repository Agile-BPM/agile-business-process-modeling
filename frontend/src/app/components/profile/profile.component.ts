import { Component, type OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { NgFor, NgIf } from "@angular/common"
import { TokenService } from "../../services/token/token-service"
import { AuthenticationService } from "../../services/auth.service"
import { JiraOauthService } from "../../services/jira-oauth-service"
import { UserService } from "../../services/user.service"
import type { UserDto } from "../../services/data/user-dto"

interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

@Component({
    selector: "app-profile",
    imports: [FormsModule, NgIf],
    templateUrl: "./profile.component.html",
    styleUrl: "./profile.component.css"
})
export class ProfileComponent implements OnInit {
  // User info
  user: UserDto = {
    firstname: "",
    lastname: "",
    email: "",
    isJiraAuthenticated: false,
  }

  // Password change
  passwordRequest: PasswordChangeRequest = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  }
  showCurrentPassword = false
  showNewPassword = false
  showConfirmPassword = false
  passwordLoading = false
  passwordError = ""
  passwordSuccess = false

  // Jira integration
  jiraConfig = {
    isConnected: false,
    lastSync: undefined as Date | undefined,
  }
  jiraLoading = false
  jiraError = ""
  jiraSuccess = false
  testingConnection = false
  integrationSuccess = false

  // UI state
  activeTab: "general" | "security" | "integrations" = "general"

  constructor(
    private tokenService: TokenService,
    private authService: AuthenticationService,
    private jiraOauthService: JiraOauthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  // todo: check query params for OAuth callback
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["code"] && params["state"]) {
        this.handleJiraOAuthCallback(params["code"], params["state"])
      }
      if (params["integrationSuccess"]) {
        this.integrationSuccess = true
        this.setActiveTab("integrations")
        this.loadUserInfo()
      }
      // Handle direct navigation to integrations tab
      if (params["tab"] === "integrations") {
        this.setActiveTab("integrations")
      }
    })
    this.loadUserInfo()
  }

  private handleJiraOAuthCallback(code: string, state: string): void {
    this.jiraOauthService
      .confirmOauth({
        body: { code, state },
      })
      .subscribe({
        next: () => {
          // OAuth callback successful
          console.log("Jira OAuth callback successful")
          // Clean up URL parameters
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { integrationSuccess: "true" },
            replaceUrl: true,
          })
        },
        error: (err) => {
          console.error("Jira OAuth callback failed:", err)
          // Clean up URL parameters even on error
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          })
        },
      })
  }

  loadUserInfo(): void {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user
      },
    })
  }

  // Tab navigation
  setActiveTab(tab: "general" | "security" | "integrations"): void {
    this.activeTab = tab
    // Clear any error/success messages when switching tabs
    this.passwordError = ""
    this.passwordSuccess = false
    this.jiraError = ""
    this.jiraSuccess = false
  }

  // todo: Password change functionality
  togglePasswordVisibility(field: "current" | "new" | "confirm"): void {
    switch (field) {
      case "current":
        this.showCurrentPassword = !this.showCurrentPassword
        break
      case "new":
        this.showNewPassword = !this.showNewPassword
        break
      case "confirm":
        this.showConfirmPassword = !this.showConfirmPassword
        break
    }
  }

  getPasswordStrength(): string {
    const password = this.passwordRequest.newPassword
    if (!password) return ""

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return "weak"
    if (score <= 4) return "medium"
    return "strong"
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength()
    switch (strength) {
      case "weak":
        return "Weak"
      case "medium":
        return "Medium"
      case "strong":
        return "Strong"
      default:
        return ""
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordLoading) return

    // Validation
    if (
      !this.passwordRequest.currentPassword ||
      !this.passwordRequest.newPassword ||
      !this.passwordRequest.confirmPassword
    ) {
      this.passwordError = "All fields are required"
      return
    }

    if (this.passwordRequest.newPassword !== this.passwordRequest.confirmPassword) {
      this.passwordError = "New passwords do not match"
      return
    }

    if (this.passwordRequest.newPassword.length < 6) {
      this.passwordError = "New password must be at least 6 characters"
      return
    }

    this.passwordLoading = true
    this.passwordError = ""

    // TODO: Implement actual password change API call
    // For now, simulate API call
    setTimeout(() => {
      this.passwordLoading = false
      this.passwordSuccess = true

      // Clear form
      this.passwordRequest = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.passwordSuccess = false
      }, 3000)
    }, 1500)
  }

  // Jira integration functionality
  initiateJiraOAuth(): void {
    if (this.testingConnection) return

    // Set loading state immediately when button is clicked
    this.testingConnection = true
    this.jiraError = ""

    this.jiraOauthService
      .initiateOauth({
        body: { email: this.user.email },
      })
      .subscribe({
        next: (redirectUrl) => {
          // Keep loading state true during redirect
          // Redirect user to Jira OAuth authorization page
          window.location.href = redirectUrl
        },
        error: (err) => {
          this.testingConnection = false
          this.jiraError = "Failed to initiate Jira OAuth. Please try again."
          console.error("OAuth initiation error:", err)
        },
      })
  }

  // todo: implement actual disconnection logic
  disconnectJira(): void {
    if (confirm("Are you sure you want to disconnect from Jira? This will remove your OAuth authorization.")) {
      console.log("Disconnecting Jira...")
      // this.jiraConfig = {
      //   isConnected: false,
      //   lastSync: undefined,
      // }
      // localStorage.removeItem("jira-oauth-config")
      // this.jiraSuccess = false
      // this.jiraError = ""
    }
  }

  // Navigation
  goBack(): void {
    this.router.navigate([""])
  }

  logout(): void {
    localStorage.removeItem("token")
    window.location.reload()
  }
}
