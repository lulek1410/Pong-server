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
  params: { id: string };
}

export type ReqMessage = JoinMsg | BasicMsg | InitMsg;
export interface BasicMsg {
  type: "leave" | "search" | "create" | "startGame";
}
