import { Rect } from "./gameLogic";

export interface JoinParams {
  code: string;
  id: string;
}

export interface JoinMsg {
  type: "join";
  params: JoinParams;
}

export interface InitMsg {
  type: "init";
  params: { id: string; isGuest: boolean };
}

export interface KeyPressMsg {
  type: "keyPress";
  params: {
    keyPressed: string;
  };
}

export interface InitOnlineGame {
  type: "initOnlineGame";
  params: {
    player1Rect: Rect;
    player2Rect: Rect;
    ballRect: Rect;
    gameBoardRect: Rect;
  };
}

export interface BasicMsg {
  type: "leave" | "search" | "create" | "startGame";
}

export type ReqMessage =
  | JoinMsg
  | BasicMsg
  | InitMsg
  | KeyPressMsg
  | InitOnlineGame;
