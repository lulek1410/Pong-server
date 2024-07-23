export interface BasicMessage {
  type: "leave" | "search" | "create";
}

export interface JoinParams {
  code: string;
  userId: string;
}

export interface JoinMessage {
  type: "join";
  params: JoinParams;
}

export interface InitMessage {
  type: "init";
  params: { userId: string | null };
}

export type Message = JoinMessage | BasicMessage | InitMessage;
