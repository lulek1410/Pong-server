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
} from "./messageHandlers";
import { ReqMessage } from "./messages.request.types";

const maxClients = 2;
let rooms: { [key: string]: WebSocket[] } = {};

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
          init(msg.params.id);
          break;
        case "startGame":
          rooms[ws["room"]]
            .find((roomWs) => roomWs["id"] !== ws["id"])
            .send(getBasicMessage("gameStarting"));
          hendleCountdown();
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      clearSearchInterval();
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
      rooms[code][0].send(getOtherPlayerJoinedMessage(ws["id"]));
      ws["room"] = code;
      ws.send(getJoinedMessage(code, rooms[code][0]["id"]));
    };

    const leave = () => {
      const room = ws["room"];
      clearSearchInterval();
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
      const maxSearchTime = 5 * 1000;
      const intervalTime = 5000;
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
          rooms[key][0].send(getOtherPlayerJoinedMessage(ws["id"]));
          ws["room"] = key;
          ws.send(getJoinedMessage(key, rooms[key][0]["id"]));
        }
      }, intervalTime);
      ws["searchInterval"] = searchInterval;
    };

    const init = (id: string | null) => {
      ws["id"] = id;
      ws.send(getBasicMessage("initialized"));
    };

    const clearSearchInterval = () => {
      const interval = ws["searchInterval"];
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
