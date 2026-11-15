import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnectCallback, onErrorCallback) {
    if (this.connected && this.client) {
      if (onConnectCallback) onConnectCallback();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws-iitsm'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        console.log('[STOMP] Connected to I-ITSM WebSocket broker');
        if (onConnectCallback) onConnectCallback();
      },
      onStompError: (frame) => {
        console.error('[STOMP] Broker error:', frame.headers['message'], frame.body);
        if (onErrorCallback) onErrorCallback(frame);
      },
      onWebSocketClose: () => {
        this.connected = false;
        console.warn('[STOMP] WebSocket connection closed');
      },
    });

    this.client.activate();
  }

  subscribe(topic, callback) {
    if (!this.client || !this.connected) {
      // Defer subscription after connect
      setTimeout(() => this.subscribe(topic, callback), 1000);
      return;
    }

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        callback(message.body);
      }
    });

    this.subscriptions.set(topic, sub);
    return sub;
  }

  unsubscribe(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('[STOMP] Disconnected');
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
