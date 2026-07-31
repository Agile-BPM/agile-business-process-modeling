import {Injectable} from '@angular/core';
import SockJS from 'sockjs-client';
import {ApiConfiguration} from "./api-configuration";
import {Client} from "@stomp/stompjs";

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService {
  private stompClient: Client;
  private heartbeatIntervalId: any;
  private readonly connectedPromise: Promise<void>;
  private connectedResolve!: () => void;
  private connected = false;

  constructor(private config: ApiConfiguration) {
    const socket = new SockJS(this.config.rootUrl + '/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    this.connectedPromise = new Promise((resolve) => {
      this.connectedResolve = resolve;
    });

    this.stompClient.onConnect = () => {
      this.connected = true;
      this.connectedResolve();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
    };

    this.stompClient.activate();
  }

  async waitForConnection() {
    if (this.connected) {
      return;
    }
    await this.connectedPromise;
  }

  async startHeartbeat(username: string, modelId: number) {
    await this.waitForConnection();

    const payload = JSON.stringify({username, modelId});

    this.stompClient.publish({
      destination: '/app/live-edit-heartbeat',
      body: payload,
    });
    this.heartbeatIntervalId = setInterval(() => {
      const payload = JSON.stringify({username, modelId});

      this.stompClient.publish({
        destination: '/app/live-edit-heartbeat',
        body: payload
      });
    }, 5000);
  }

  stopHeartbeat(username: string, modelId: number) {
    const payload = JSON.stringify({username, modelId});
    this.stompClient.publish({
      destination: '/app/leave-edit-mode',
      body: payload
    })
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }
}
