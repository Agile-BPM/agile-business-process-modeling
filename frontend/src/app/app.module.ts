import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"
import {AppComponent} from "./app.component"
import {BpmnViewerComponent} from "./components/bpmn-viewer/bpmn-viewer.component"
import {HeaderComponent} from "./components/header/header.component"
import {SidebarComponent} from "./components/sidebar/sidebar.component"
import {AppRoutingModule} from "./app-routing.module"
import {MainLayoutComponent} from "./components/main-layout/main-layout.component"
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import {HttpTokenInterceptor} from "./services/interceptor/http-token.interceptor";
import {ProfileComponent} from "./components/profile/profile.component";
import {ModelEditComponent} from "./components/model-edit/model-edit.component";

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BpmnViewerComponent,
        HeaderComponent,
        SidebarComponent,
        MainLayoutComponent,
        ProfileComponent,
        ModelEditComponent], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpTokenInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {
}
