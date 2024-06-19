import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { v4 } from "uuid";

interface ConnectionMessage {
  type: "leave" | "create";
}

interface JoinMessage {
  type: "join";
  params: { code: string };
}

type Message = JoinMessage | ConnectionMessage;

const maxClients = 2;
let rooms = {};

const sendInformation = (ws: WebSocket) => {
  let obj;
  if (ws["room"])
    obj = {
      type: "info",
      params: {
        room: ws["room"],
        clientsNumber: rooms[ws["room"]].length,
      },
    };
  else
    obj = {
      type: "info",
      params: {
        room: "no room",
      },
    };

  ws.send(JSON.stringify(obj));
};

export const configureWss = (server: Server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    console.log("new client connected");
    ws.send("Welcome new client");

    ws.on("message", (message: WebSocket.Data) => {
      const msg: Message = JSON.parse(message.toString());
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
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("server close ws");
    });

    const create = () => {
      const room = v4();
      rooms[room] = [ws];
      ws["room"] = room;
      sendInformation(ws);
    };

    const join = (code) => {
      
    };

    const leave = () => {};
  });
};
