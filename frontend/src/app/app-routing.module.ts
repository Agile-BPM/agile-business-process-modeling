import {NgModule} from "@angular/core"
import {RouterModule, type ExtraOptions, type Routes} from "@angular/router"
import {LoginComponent} from "./components/auth/login/login.component"
import {RegisterComponent} from "./components/auth/register/register.component"
import {MainLayoutComponent} from "./components/main-layout/main-layout.component"
import {authGuard} from "./services/guard/auth-guard"
import {ProfileComponent} from "./components/profile/profile.component";
import {ModelEditComponent} from "./components/model-edit/model-edit.component";
import {pendingChangesGuard} from "./services/guard/pending-changes-guard";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: "edit/:id",
    component: ModelEditComponent,
    canActivate: [authGuard],
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: [authGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
]

const routerOptions: ExtraOptions = {
  canceledNavigationResolution: "computed",
}

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
