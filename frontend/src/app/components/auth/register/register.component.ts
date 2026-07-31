import {Component} from "@angular/core"
import {Router, RouterLink} from "@angular/router"
import {FormsModule} from "@angular/forms"
import {NgIf} from "@angular/common"
import {AuthenticationService} from "../../../services/auth.service"
import {RegistrationRequest} from "../../../services/api/registration-request"

@Component({
    selector: "app-register",
    imports: [FormsModule, NgIf, RouterLink],
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.css"
})
export class RegisterComponent {
  registerRequest: RegistrationRequest = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  }

  isLoading = false
  errorMessage = ""
  showPassword = false
  showConfirmPassword = false
  confirmPassword = ""

  isVerificationStep = false
  verificationToken = ""
  isVerifying = false

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
  }

  // todo: beim navigaten aus der email - muss auf register gehen - und es müssen hier query param mitgegeben werden um den schicken dings da zu sehen

  onSubmit(): void {
    if (this.isLoading) return

    if (this.registerRequest.password !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    this.authService.register({
      body: this.registerRequest
    }).subscribe({
      next: () => {
        this.isLoading = false
        // Instead of navigating, show verification step
        this.isVerificationStep = true
        this.errorMessage = ""
      },
      error: (err) => {
        this.isLoading = false
        if (err.error.validationErrors) {
          this.errorMessage = err.error.validationErrors;
        } else {
          this.errorMessage = err.error.error;
        }
      },
    })
  }

  private confirmAccount(token: string) {
    if (this.isVerifying || !this.verificationToken.trim()) return

    this.isVerifying = true
    this.errorMessage = ""

    this.authService.confirm({
      token
    }).subscribe({
      next: () => {
        this.isVerifying = false
        this.router.navigate(["/login"], {
          queryParams: {
            verified: "true",
            email: this.registerRequest.email,
          },
        })
      },
      error: (err) => {
        this.isVerifying = false
        if (err.error.validationErrors) {
          this.errorMessage = err.error.validationErrors;
        } else {
          this.errorMessage = err.error.error;
        }
      }
    });
  }

  onCodeCompleted() {
    this.confirmAccount(this.verificationToken);
  }

  resendVerificationEmail(): void {
    // TODO: Implement resend verification email functionality
    // This would call a new API endpoint to resend the verification email
    console.log("Resend verification email for:", this.registerRequest.email)
    alert("Verification email resent! Please check your inbox.")
  }

  goBackToRegistration(): void {
    this.isVerificationStep = false
    this.verificationToken = ""
    this.errorMessage = ""
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  getPasswordStrength(): string {
    const password = this.registerRequest.password
    if (!password) return ""

    let score = 0

    // Length check
    if (password.length >= 8) score++
    if (password.length >= 12) score++

    // Character variety checks
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
}
