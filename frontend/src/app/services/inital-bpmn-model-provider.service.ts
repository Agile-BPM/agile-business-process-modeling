import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InitalBpmnModelProviderService {

  constructor() {
  }

  getInitialProjectModelXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:custom="http://custom-bpmn/schema"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1750966768640"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="Event_10rq58d">
      <bpmn:outgoing>Flow_1anbznt</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:subProcess id="Activity_0g1zk0i"
                     name="Epic - A body of work that can be broken down into smaller user stories"
                     custom:epicTitle="Epic - A body of work that can be broken down into smaller user stories"
                     custom:epicStatus="Planning" custom:epicStatusCategory="new" custom:epicProgress="0" custom:epicIssueType="Epic"
                     custom:epic="true">
      <bpmn:incoming>Flow_1anbznt</bpmn:incoming>
      <bpmn:outgoing>Flow_1eiwzdj</bpmn:outgoing>
      <bpmn:subProcess id="Activity_05sltba"
                       name="Feature written from the perspective of the end user or customer"
                       custom:userStoryTitle="Feature written from the perspective of the end user or customer"
                       custom:userStoryStatus="Backlog" custom:userStoryStatusCategory="new" custom:userStoryPriority="Medium" custom:userStoryProgress="0"
                       custom:userStoryIssueType="Story" custom:userStory="true">
        <bpmn:incoming>Flow_0q2q4hs</bpmn:incoming>
        <bpmn:outgoing>Flow_1ssczi7</bpmn:outgoing>
      </bpmn:subProcess>
      <bpmn:startEvent id="Event_170nz69">
        <bpmn:outgoing>Flow_0q2q4hs</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:sequenceFlow id="Flow_0q2q4hs" sourceRef="Event_170nz69" targetRef="Activity_05sltba"/>
      <bpmn:endEvent id="Event_01dpctv">
        <bpmn:incoming>Flow_1ssczi7</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_1ssczi7" sourceRef="Activity_05sltba" targetRef="Event_01dpctv"/>
    </bpmn:subProcess>
    <bpmn:sequenceFlow id="Flow_1anbznt" sourceRef="Event_10rq58d" targetRef="Activity_0g1zk0i"/>
    <bpmn:endEvent id="Event_1igamj9">
      <bpmn:incoming>Flow_1eiwzdj</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1eiwzdj" sourceRef="Activity_0g1zk0i" targetRef="Event_1igamj9"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Event_10rq58d_di" bpmnElement="Event_10rq58d">
        <dc:Bounds x="142" y="62" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1igamj9_di" bpmnElement="Event_1igamj9">
        <dc:Bounds x="912" y="62" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0g1zk0i_di" bpmnElement="Activity_0g1zk0i" isExpanded="true">
        <dc:Bounds x="230" y="-30" width="620" height="200"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_170nz69_di" bpmnElement="Event_170nz69">
        <dc:Bounds x="272" y="62" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_01dpctv_di" bpmnElement="Event_01dpctv">
        <dc:Bounds x="722" y="62" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_05sltba_di" bpmnElement="Activity_05sltba">
        <dc:Bounds x="450" y="30" width="150" height="100"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_0q2q4hs_di" bpmnElement="Flow_0q2q4hs">
        <di:waypoint x="308" y="80"/>
        <di:waypoint x="450" y="80"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1ssczi7_di" bpmnElement="Flow_1ssczi7">
        <di:waypoint x="600" y="80"/>
        <di:waypoint x="722" y="80"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1anbznt_di" bpmnElement="Flow_1anbznt">
        <di:waypoint x="178" y="80"/>
        <di:waypoint x="230" y="80"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1eiwzdj_di" bpmnElement="Flow_1eiwzdj">
        <di:waypoint x="850" y="80"/>
        <di:waypoint x="912" y="80"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1e3d0dl">
    <bpmndi:BPMNPlane id="BPMNPlane_0fsiq1l" bpmnElement="Activity_05sltba"/>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
  }
}
