import {CanDeactivateFn} from "@angular/router"
import {Observable} from "rxjs"

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component?.canDeactivate) {
    return component.canDeactivate()
  }
  return true
}
