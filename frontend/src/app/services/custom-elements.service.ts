import {Injectable} from "@angular/core"
import {BehaviorSubject} from "rxjs"
import {CustomElement, DEFAULT_CUSTOM_ELEMENTS} from "./models/custom-elements";

// This service provides all custom BPMN Elements

@Injectable({
  providedIn: "root",
})
export class CustomElementsService {
  private customElementsSubject = new BehaviorSubject<CustomElement[]>(DEFAULT_CUSTOM_ELEMENTS)

  constructor() {
    this.loadCustomElements()
  }

  private loadCustomElements(): void {
    try {
      const savedElements = localStorage.getItem("bpmn-custom-elements")
      if (savedElements) {
        this.customElementsSubject.next(this.mergeWithDefaultProperties(JSON.parse(savedElements)))
      }
    } catch (error) {
      console.error("Error loading custom elements:", error)
      this.customElementsSubject.next(DEFAULT_CUSTOM_ELEMENTS)
    }
  }

  getCustomElements(): CustomElement[] {
    return this.customElementsSubject.getValue()
  }

  private mergeWithDefaultProperties(elements: CustomElement[]): CustomElement[] {
    return elements.map((element) => {
      const defaultElement = DEFAULT_CUSTOM_ELEMENTS.find((candidate) => candidate.type === element.type)
      if (!defaultElement) {
        return element
      }

      const propertyNames = new Set(element.properties.map((property) => property.name))
      const missingDefaultProperties = defaultElement.properties.filter((property) => !propertyNames.has(property.name))
      return {
        ...element,
        properties: [...element.properties, ...missingDefaultProperties],
      }
    })
  }

  generateModdleDescriptor(): any {
    const elements = this.getCustomElements()
    const types: any[] = []

    elements.forEach((element) => {
      const type: any = {
        name: element.type.split(":")[0],
        extends: [element.extends],
        properties: [],
      }

      element.properties.forEach((prop) => {
        type.properties.push({
          name: prop.name,
          isAttr: true,
          type: this.mapPropertyTypeToModdleType(prop.type),
        })
      })

      types.push(type)
    })

    return {
      name: "CustomBpmnExtension",
      uri: "http://custom-bpmn/schema",
      prefix: "custom",
      xml: {
        tagAlias: "lowerCase",
      },
      types,
    }
  }

  private mapPropertyTypeToModdleType(propType: string): string {
    switch (propType) {
      case "boolean":
        return "Boolean"
      case "integer":
        return "Integer"
      case "float":
        return "Float"
      case "enum":
        return "String"
      default:
        return "String"
    }
  }
}
