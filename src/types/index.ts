import { Request } from "express";

export interface ISessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ISocketIO {
  emit(eventName: string, value: any): void;
}

export type IRequest = Request & {
  session: { user: ISessionUser };
  io: ISocketIO;
};
