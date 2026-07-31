export default function CustomContextPadProvider(
  bpmnFactory: any, config: any, contextPad: any, create: any, elementFactory: any, injector: any, translate: any
) {
  this.bpmnFactory = bpmnFactory;
  this.create = create;
  this.elementFactory = elementFactory;
  this.translate = translate;

  if (config.autoPlace !== false) {
    this.autoPlace = injector.get('autoPlace', false);
  }

  contextPad.registerProvider(this)
}

CustomContextPadProvider.prototype.getContextPadEntries = function (element: any) {
  const {
    autoPlace,
    bpmnFactory,
    create,
    elementFactory,
    translate,
  } = this;

  const isValidContext = (element: any) => {
    const invalidTypes = ['bpmn:EndEvent', 'bpmn:SequenceFlow', 'label'];
    return !invalidTypes.includes(element.type);
  };


  function appendUserStory() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:SubProcess")
      const shape = elementFactory.createShape({
        type: "bpmn:SubProcess",
        businessObject: businessObject,
        width: 150,
        height: 100,
      });
      shape.businessObject.$attrs[`custom:userStory`] = "true"

      if (autoPlace) {
        autoPlace.append(element, shape);
      } else {
        create.start(event, shape, element);
      }
    };
  }

  function appendUserStoryDragstart() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:SubProcess")
      const shape = elementFactory.createShape({
        type: "bpmn:SubProcess",
        businessObject: businessObject,
        width: 150,
        height: 100,
      });
      shape.businessObject.$attrs[`custom:userStory`] = "true"

      create.start(event, shape, element);
    };
  }

  function appendEpic() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:SubProcess")
      const shape = elementFactory.createShape({
        type: "bpmn:SubProcess",
        businessObject: businessObject,
        width: 350,
        height: 200,
      });
      shape.businessObject.$attrs[`custom:epic`] = "true"
      shape.collapsed = false
      shape.di.isExpanded = true;

      if (autoPlace) {
        autoPlace.append(element, shape);
      } else {
        create.start(event, shape, element);
      }
    };
  }

  function appendEpicDragstart() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:SubProcess")
      const shape = elementFactory.createShape({
        type: "bpmn:SubProcess",
        businessObject: businessObject,
        width: 350,
        height: 200,
      });
      shape.businessObject.$attrs[`custom:epic`] = "true"
      shape.collapsed = false
      shape.di.isExpanded = true;

      create.start(event, shape, element);
    };
  }

  function appendSubTask() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:Task")
      const shape = elementFactory.createShape({
        type: "bpmn:Task",
        businessObject: businessObject,
        width: 150,
        height: 100,
      });
      shape.businessObject.$attrs[`custom:subtask`] = "true"

      if (autoPlace) {
        autoPlace.append(element, shape);
      } else {
        create.start(event, shape, element);
      }
    };
  }

  function appendSubTaskDragstart() {
    return function (event: any, element: any) {
      const businessObject = bpmnFactory.create("bpmn:Task")
      const shape = elementFactory.createShape({
        type: "bpmn:Task",
        businessObject: businessObject,
        width: 150,
        height: 100,
      });
      shape.businessObject.$attrs[`custom:subtask`] = "true"

      create.start(event, shape, element);
    };
  }

  if (isValidContext(element)) {
    return {
      "append.user-story": {
        group: "custom",
        className: `custom-icon-userStory-pad`,
        title: translate("Append User Story"),
        action: {
          click: appendUserStory(),
          dragstart: appendUserStoryDragstart(),
        },
      },
      "append.epic": {
        group: "custom",
        className: `custom-icon-epic-pad`,
        title: translate("Append Epic"),
        action: {
          click: appendEpic(),
          dragstart: appendEpicDragstart(),
        },
      },
      "append.subTask": {
        group: "custom",
        className: `custom-icon-subtask-pad`,
        title: translate("Append Subtask"),
        action: {
          click: appendSubTask(),
          dragstart: appendSubTaskDragstart(),
        },
      },
    }
  }
  return {};
}

