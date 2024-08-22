import { GameFrameResult } from "./gameLogic";
import {
  BasicRequestMsgType,
  CountdownMsg,
  CreatedMsg,
  ErrorMsg,
  JoinedMsg,
  OtherPlayerJoinedMsg,
  UpdateMsg,
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

export const getOtherPlayerJoinedMessage = (
  playerId: string,
  isGuest: boolean
) => {
  const msg: OtherPlayerJoinedMsg = {
    type: "otherPlayerJoined",
    params: {
      player: { id: playerId, isGuest },
    },
  };
  return JSON.stringify(msg);
};

export const getJoinedMessage = (
  roomId: string,
  playerId: string,
  isGuest: boolean
) => {
  const msg: JoinedMsg = {
    type: "joined",
    params: {
      roomId,
      otherPlayer: { id: playerId, isGuest },
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

export const getUpdateMessage = (updateData: GameFrameResult) => {
  const msg: UpdateMsg = {
    type: "update",
    params: updateData,
  };
  return JSON.stringify(msg);
};
