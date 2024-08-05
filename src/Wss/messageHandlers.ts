import {
  BasicRequestMsgType,
  CountdownMsg,
  CreatedMsg,
  ErrorMsg,
  JoinedMsg,
  OtherPlayerJoinedMsg,
} from "./messages.response.types";

export const getCreatedMessage = (roomId: string) => {
  const msg: CreatedMsg = {
    type: "created",
    params: {
      roomId,
    },
  };
  return JSON.stringify(msg);
};

export const getErrorMessage = (errorMessage: string) => {
  const msg: ErrorMsg = {
    type: "error",
    params: { error: errorMessage },
  };
  return JSON.stringify(msg);
};

export const getOtherPlayerJoinedMessage = (playerId: string) => {
  const msg: OtherPlayerJoinedMsg = {
    type: "otherPlayerJoined",
    params: {
      player: { id: playerId },
    },
  };
  return JSON.stringify(msg);
};

export const getJoinedMessage = (roomId: string, playerId: string) => {
  const msg: JoinedMsg = {
    type: "joined",
    params: {
      roomId,
      otherPlayer: { id: playerId },
    },
  };
  return JSON.stringify(msg);
};

export const getBasicMessage = (type: BasicRequestMsgType) =>
  JSON.stringify({ type });

export const getCountdownMessage = (count: number) => {
  const msg: CountdownMsg = {
    type: "countdown",
    params: {
      count,
    },
  };
  return JSON.stringify(msg);
};
