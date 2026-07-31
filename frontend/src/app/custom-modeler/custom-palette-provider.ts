export default class CustomPaletteProvider {
  protected bpmnFactory: any
  protected palette: any
  protected create: any
  protected elementFactory: any
  protected customElementsService: any

  constructor(bpmnFactory: any, palette: any, create: any, elementFactory: any, customElementsService: any) {
    this.bpmnFactory = bpmnFactory
    this.palette = palette
    this.create = create
    this.elementFactory = elementFactory
    this.customElementsService = customElementsService

    palette.registerProvider(this)
  }

  getPaletteEntries(): any {
    const customElements = this.customElementsService.getCustomElements();
    const entries: any = {};

    customElements.forEach((customElement: any) => {
      const [namespace, type] = customElement.type.split(":");

      entries[`create.custom-${namespace}`] = {
        group: "custom",
        className: `custom-icon-${namespace}`,
        title: `Create ${customElement.label}`,
        action: {
          dragstart: (event: any) => this.createCustomElement(event, customElement),
          click: (event: any) => this.createCustomElement(event, customElement),
        },
      };
    });

    return entries;
  }

  createCustomElement(event: any, customElement: any): void {
    const shape = this.createCustomElementShape(customElement)

    this.create.start(event, shape)
  }

  createCustomElementShape(customElement: any): any {
    const [namespace, type] = customElement.type.split(":")
    const baseElement = customElement.extends

    const businessObject = this.bpmnFactory.create('bpmn:' + type);

    const shape = this.elementFactory.createShape({
      type: baseElement,
      businessObject: businessObject
    })

    shape.businessObject.$attrs[`custom:${namespace}`] = "true"
    customElement.properties.forEach((prop: any) => {
      if (prop.default !== undefined) {
        shape.businessObject.$attrs[`custom:${prop.name}`] = String(prop.default)
      }
    })

    if (customElement.type === "userStory:SubProcess") {
      shape.width = 150
      shape.height = 100
    }

    if (customElement.type === "epic:SubProcess") {
      shape.width = 350
      shape.height = 200
      shape.collapsed = false
      shape.di.isExpanded = true
    }

    if (customElement.type === "subtask:Task") {
      shape.width = 150
      shape.height = 100
    }

    return shape
  }

}
