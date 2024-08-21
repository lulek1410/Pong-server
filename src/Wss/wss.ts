import { Server } from "http";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

import {
  getBasicMessage,
  getCountdownMessage,
  getCreatedMessage,
  getErrorMessage,
  getJoinedMessage,
  getOtherPlayerJoinedMessage,
  getUpdateMessage,
} from "./messageHandlers";
import { ReqMessage } from "./messages.request.types";
import { Game } from "./gameLogic";

const maxClients = 2;
let rooms: { [key: string]: WebSocket[] } = {};

const game = new Game();

export const configureWss = (server: Server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    ws.on("message", (message: WebSocket.Data) => {
      const msg: ReqMessage = JSON.parse(message.toString());
      console.log(msg);
      switch (msg.type) {
        case "join":
          join(msg.params.code);
          break;
        case "create":
          create();
          break;
        case "leave":
          leave();
          break;
        case "search":
          search();
          break;
        case "init":
          init(msg.params.id, msg.params.isGuest);
          break;
        case "startGame":
          sendToAllUsers(getBasicMessage("gameStarting"));
          hendleCountdown();
          break;
        case "keyPress":
          ws["keyPressed"] = msg.params.keyPressed;
          break;
        case "initOnlineGame":
          game.initGame(
            msg.params.player1Rect,
            msg.params.player2Rect,
            msg.params.ballRect,
            msg.params.gameBoardRect
          );
          const gameLoop = setInterval(() => {
            const [player1Offset, player2Offset] = rooms[ws["room"]].map(
              (roomWs) => roomWs["keyPressed"]
            );
            const updateData = game.runFrame(player1Offset, player2Offset);
            sendToAllUsers(getUpdateMessage(updateData));
          }, 1000);
          rooms[ws["room"]].map(
            (roomWs) => (roomWs["gameLoopInterval"] = gameLoop)
          );
          break;
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      clearProvidedInterval("searchInterval");
      console.log("server close ws");
    });

    const create = () => {
      const room = v4();
      rooms[room] = [ws];
      ws["room"] = room;
      ws.send(getCreatedMessage(room));
    };

    const join = (code: string) => {
      if (!Object.keys(rooms).includes(code)) {
        ws.send(getErrorMessage(`Room with code: ${code} does not exist`));
        return;
      }
      if (rooms[code].length >= maxClients) {
        ws.send(getErrorMessage(`Room with code: ${code} is full`));
        return;
      }
      rooms[code].push(ws);
      rooms[code][0].send(getOtherPlayerJoinedMessage(ws["id"], ws["isGuest"]));
      ws["room"] = code;
      ws.send(getJoinedMessage(code, rooms[code][0]["id"], ws["isGuest"]));
    };

    const leave = () => {
      const room = ws["room"];
      clearProvidedInterval("searchInterval");
      clearProvidedInterval("countdownInterval");
      clearProvidedInterval("gameLoopInterval");
      if (room) {
        rooms[room] = rooms[room].filter((client) => client !== ws);
        ws["room"] = undefined;
        if (rooms[room].length === 0) {
          delete rooms[room];
        } else {
          rooms[room][0].send(getBasicMessage("otherPlayerLeft"));
        }
      }
    };

    const search = () => {
      const startTime = Date.now();
      const maxSearchTime = 60 * 1000;
      const intervalTime = 2000;
      const searchInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > maxSearchTime) {
          clearInterval(searchInterval);
          create();
          return;
        }
        const result = Object.entries(rooms).find(
          ([key, value]) => value.length < maxClients
        );
        if (result) {
          clearInterval(searchInterval);
          const [key, value] = result;
          rooms[key].push(ws);
          rooms[key][0].send(
            getOtherPlayerJoinedMessage(ws["id"], ws["isGuest"])
          );
          ws["room"] = key;
          ws.send(getJoinedMessage(key, rooms[key][0]["id"], ws["isGuest"]));
        }
      }, intervalTime);

      ws["searchInterval"] = searchInterval;
    };

    const init = (id: string, isGuest: boolean) => {
      ws["id"] = id;
      ws["isGuest"] = isGuest;
      ws.send(getBasicMessage("initialized"));
    };

    const clearProvidedInterval = (intervalName: string) => {
      const interval = ws[intervalName];
      if (interval) {
        clearInterval(interval);
      }
    };

    const hendleCountdown = () => {
      const startTime = Date.now();
      const initialCount = 5;
      const intervalTime = 200;
      let count = 0;
      sendToAllUsers(getCountdownMessage(initialCount));
      const countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        if (elapsedTime - count > 1) {
          count++;
          sendToAllUsers(getCountdownMessage(initialCount - count));
          if (count === initialCount) {
            clearInterval(countdownInterval);
          }
        }
      }, intervalTime);
      rooms[ws["room"]].map(
        (roomWs) => (roomWs["countdownInterval"] = countdownInterval)
      );
    };

    const sendToAllUsers = (message: string) => {
      rooms[ws["room"]].map((roomWs) => roomWs.send(message));
    };
  });
};
