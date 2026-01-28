import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { asyncStorageAdapter } from './storage';

const SOCKET_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3030';

let socket: Socket | null = null;
let feathersClientInstance: ReturnType<typeof feathers> | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
    });
  }
  return socket;
};

export const getFeathersClient = (): ReturnType<typeof feathers> => {
  if (!feathersClientInstance) {
    const app = feathers();
    const socket = getSocket();

    app.configure(socketio(socket));
    app.configure(
      auth({
        storage: asyncStorageAdapter,
        storageKey: 'feathers-jwt',
        jwtStrategy: 'jwt',
      })
    );

    feathersClientInstance = app;
  }
  return feathersClientInstance;
};

export const feathersClient = getFeathersClient();

export default feathersClient;
