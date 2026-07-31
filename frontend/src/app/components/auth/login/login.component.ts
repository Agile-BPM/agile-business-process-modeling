import {Component, OnInit} from "@angular/core"
import {ActivatedRoute, Router, RouterLink} from "@angular/router"
import {FormsModule} from "@angular/forms"
import {NgIf} from "@angular/common"
import {AuthenticationService} from "../../../services/auth.service"
import {TokenService} from "../../../services/token/token-service";
import {AuthenticationRequest} from "../../../services/api/authentication-request";

@Component({
    selector: "app-login",
    imports: [FormsModule, NgIf, RouterLink],
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.css"
})
export class LoginComponent implements OnInit {
  authRequest: AuthenticationRequest = {email: "", password: ""}

  isLoading = false
  errorMessage = ""
  showPassword = false
  successMessage = ""

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private tokenService: TokenService
  ) {
  }

  ngOnInit(): void {
    // Check for verification success
    this.route.queryParams.subscribe((params) => {
      if (params["verified"] === "true") {
        this.successMessage = "Email verified successfully! You can now sign in."
        if (params["email"]) {
          this.authRequest.email = params["email"]
        }
      }
    })
  }

  onSubmit(): void {
    if (this.isLoading) return

    this.isLoading = true
    this.errorMessage = ""

    this.authService.authenticate({
      body: this.authRequest
    }).subscribe({
      next: (result) => {
        this.isLoading = false
        this.tokenService.token = result.token as string
        this.router.navigate([""], {replaceUrl: true})
      },
      error: (err) => {
        this.isLoading = false
        if (err.error.validationErrors) {
          this.errorMessage = err.error.validationErrors.join(", ")
        } else {
          this.errorMessage = err.error.error || "An error occurred. Please try again."
        }
      },
    })
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }
}
