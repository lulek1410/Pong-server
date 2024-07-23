export interface BasicMessage {
  type: "leave" | "search" | "create";
}

export interface JoinParams {
  code: string;
  id: string;
}

export interface JoinMessage {
  type: "join";
  params: JoinParams;
}

export interface InitMessage {
  type: "init";
  params: { id: string | null };
}

export type Message = JoinMessage | BasicMessage | InitMessage;
