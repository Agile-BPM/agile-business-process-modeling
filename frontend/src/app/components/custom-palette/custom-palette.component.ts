import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomElementsService} from '../../services/custom-elements.service';

export interface PaletteItem {
  type: string;
  title: string;
  icon: string;
  bpmnIcon?: string;
  category: 'events' | 'tasks' | 'gateways' | 'flows' | 'custom';
}

@Component({
    selector: 'app-custom-palette',
    imports: [CommonModule],
    templateUrl: './custom-palette.component.html',
    styleUrls: ['./custom-palette.component.css']
})
export class CustomPaletteComponent {
  @Input() bpmnModeler: any;

  collapsedSections: { [key: string]: boolean } = {};

  standardElements: PaletteItem[] = [
    // Events
    {
      type: 'bpmn:StartEvent',
      title: 'Start Event',
      icon: 'start-event',
      bpmnIcon: 'bpmn-icon-start-event-none',
      category: 'events'
    },
    {
      type: 'bpmn:EndEvent',
      title: 'End Event',
      icon: 'end-event',
      bpmnIcon: 'bpmn-icon-end-event-none',
      category: 'events'
    },
    {
      type: 'bpmn:IntermediateThrowEvent',
      title: 'Intermediate Event',
      icon: 'intermediate-event',
      bpmnIcon: 'bpmn-icon-intermediate-event-none',
      category: 'events'
    },

    // Tasks
    {type: 'bpmn:Task', title: 'Task', icon: 'task', bpmnIcon: 'bpmn-icon-task', category: 'tasks'},
    {type: 'bpmn:UserTask', title: 'User Task', icon: 'user-task', bpmnIcon: 'bpmn-icon-user-task', category: 'tasks'},
    {
      type: 'bpmn:ServiceTask',
      title: 'Service Task',
      icon: 'service-task',
      bpmnIcon: 'bpmn-icon-service',
      category: 'tasks'
    },
    {
      type: 'bpmn:ScriptTask',
      title: 'Script Task',
      icon: 'script-task',
      bpmnIcon: 'bpmn-icon-script',
      category: 'tasks'
    },
    {
      type: 'bpmn:CallActivity',
      title: 'Call Activity',
      icon: 'call-activity',
      bpmnIcon: 'bpmn-icon-call-activity',
      category: 'tasks'
    },
    {
      type: 'bpmn:SubProcess',
      title: 'Sub Process',
      icon: 'subprocess',
      bpmnIcon: 'bpmn-icon-subprocess-expanded',
      category: 'tasks'
    },

    // Gateways
    {
      type: 'bpmn:ExclusiveGateway',
      title: 'Exclusive Gateway',
      icon: 'exclusive-gateway',
      bpmnIcon: 'bpmn-icon-gateway-xor',
      category: 'gateways'
    },
    {
      type: 'bpmn:ParallelGateway',
      title: 'Parallel Gateway',
      icon: 'parallel-gateway',
      bpmnIcon: 'bpmn-icon-gateway-parallel',
      category: 'gateways'
    },
    {
      type: 'bpmn:InclusiveGateway',
      title: 'Inclusive Gateway',
      icon: 'inclusive-gateway',
      bpmnIcon: 'bpmn-icon-gateway-or',
      category: 'gateways'
    },
    {
      type: 'bpmn:EventBasedGateway',
      title: 'Event Gateway',
      icon: 'event-gateway',
      bpmnIcon: 'bpmn-icon-gateway-eventbased',
      category: 'gateways'
    },
  ];

  customElements: PaletteItem[] = [
    {type: 'custom:Epic', title: 'Epic', icon: 'epic', category: 'custom'},
    {type: 'custom:UserStory', title: 'User Story', icon: 'user-story', category: 'custom'},
    {type: 'custom:Subtask', title: 'Task', icon: 'subtask', category: 'custom'},
  ];

  constructor(private customElementsService: CustomElementsService) {
  }

  get eventElements(): PaletteItem[] {
    return this.standardElements.filter(e => e.category === 'events');
  }

  get taskElements(): PaletteItem[] {
    return this.standardElements.filter(e => e.category === 'tasks');
  }

  get gatewayElements(): PaletteItem[] {
    return this.standardElements.filter(e => e.category === 'gateways');
  }

  toggleSection(section: string): void {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  isSectionCollapsed(section: string): boolean {
    return this.collapsedSections[section] === true;
  }

  getIconClasses(item: PaletteItem): string[] {
    return item.bpmnIcon ? ['icon-bpmn'] : [`icon-${item.icon}`];
  }

  onDragStart(event: DragEvent, item: PaletteItem): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    }

    if (!this.bpmnModeler) return;

    if (item.type.startsWith('custom:')) {
      this.createCustomElement(event, item);
    } else {
      this.startBpmnElementCreation(event, item);
    }
  }

  onElementClick(event: any, item: PaletteItem): void {
    if (!this.bpmnModeler) return;

    if (item.type.startsWith('custom:')) {
      this.createCustomElement(event, item);
    } else {
      this.startBpmnElementCreation(event, item);
    }
  }

  private startBpmnElementCreation(event: DragEvent, item: PaletteItem): void {
    const create = this.bpmnModeler.get('create');
    const shape = this.createBpmnElementShape(item);

    if (shape) {
      create.start(event, shape);
    }
  }

  private createBpmnElementShape(item: PaletteItem): any {
    const elementFactory = this.bpmnModeler.get('elementFactory');

    return elementFactory.createShape({
      type: item.type,
      name: item.title,
      // name: item.type.includes('Gateway') ? '' : item.title,
    });
  }

  private createCustomElement(event: DragEvent, item: PaletteItem): void {
    const customElement = this.getCustomPaletteElement(item);

    if (!customElement) {
      return;
    }

    const customPaletteProvider = this.bpmnModeler.get('customPaletteProvider');
    customPaletteProvider.createCustomElement(event, customElement);
  }

  private createCustomElementAtViewportCenter(item: PaletteItem): void {
    const customElement = this.getCustomPaletteElement(item);

    if (!customElement) {
      return;
    }

    const customPaletteProvider = this.bpmnModeler.get('customPaletteProvider');
    const shape = customPaletteProvider.createCustomElementShape(customElement);

    if (shape) {
      this.createShapeAtViewportCenter(shape);
    }
  }

  private createShapeAtViewportCenter(shape: any): void {
    const canvas = this.bpmnModeler.get('canvas');
    const modeling = this.bpmnModeler.get('modeling');
    const rootElement = canvas.getRootElement();
    const viewbox = canvas.viewbox();

    modeling.createShape(shape, {
      x: viewbox.x + viewbox.width / 2,
      y: viewbox.y + viewbox.height / 2,
    }, rootElement);

    const selection = this.bpmnModeler.get('selection');
    selection.select(shape);
  }

  private getCustomPaletteElement(item: PaletteItem): any {
    const typeByPaletteType: { [key: string]: string } = {
      'custom:Epic': 'epic:SubProcess',
      'custom:UserStory': 'userStory:SubProcess',
      'custom:Subtask': 'subtask:Task',
    };

    const customElementType = typeByPaletteType[item.type];

    return this.customElementsService
      .getCustomElements()
      .find((customElement: any) => customElement.type === customElementType);
  }

}
