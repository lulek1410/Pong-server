import { GameFrameResult } from "./gameLogic";

export interface JoinedMsg {
  type: "joined";
  params: {
    roomId: string;
    otherPlayer: { id: string | null; isGuest: boolean };
  };
}

export interface UpdateMsg {
  type: "update";
  params: GameFrameResult;
}

export interface OtherPlayerJoinedMsg {
  type: "otherPlayerJoined";
  params: { player: { id: string; isGuest: boolean } };
}

export interface CreatedMsg {
  type: "created";
  params: { roomId: string };
}

export interface ErrorMsg {
  type: "error";
  params: { error: string };
}

export interface CountdownMsg {
  type: "countdown";
  params: { count: number };
}

export type BasicRequestMsgType =
  | "otherPlayerLeft"
  | "initialized"
  | "gameStarting";
