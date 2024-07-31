import { Server } from "http";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

import { ReqMessage } from "./messages.request.types";
import {
  getCreatedMessage,
  getErrorMessage,
  getJoinedMessage,
  getOtherPlayerJoinedMessage,
} from "./messageHandlers";

const maxClients = 2;
let rooms: { [key: string]: WebSocket[] } = {};

export const configureWss = (server: Server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    console.log("new client connected");

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
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      const interval = ws["searchInterval"];
      if (interval) {
        clearInterval(interval);
      }
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
      if (room) {
        rooms[room] = rooms[room].filter((client) => client !== ws);
        ws["room"] = undefined;
        if (rooms[room].length === 0) {
          delete rooms[room];
        }
      }
    };

    const search = () => {
      const startTime = Date.now();
      const maxSearchTime = 5 * 1000;
      const intervalTime = 1000;
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
      ws.send(JSON.stringify({ type: "initialized" }));
    };
  });
};
