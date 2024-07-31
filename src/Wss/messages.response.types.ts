export interface InitializedMsg {
  type: "initialized";
}

export interface JoinedMsg {
  type: "joined";
  params: { roomId: string; otherPlayer: { id: string | null } };
}

export interface OtherPlayerJoinedMsg {
  type: "otherPlayerJoined";
  params: { player: { id: string | null } };
}

export interface CreatedMsg {
  type: "created";
  params: { roomId: string };
}

export interface ErrorMsg {
  type: "error";
  params: { error: string };
}
