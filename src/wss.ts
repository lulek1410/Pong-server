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
let rooms: { [key: string]: WebSocket[] } = {};

const sendInformation = (ws: WebSocket) => {
  let obj;
  if (ws["room"])
    obj = {
      type: "info",
      params: { room: ws["room"], clientsNumber: rooms[ws["room"]].length },
    };
  else if (rooms[ws["room"]])
    obj = { type: "info", params: { room: "room full" } };
  else obj = { type: "info", params: { room: "no room" } };

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

    const join = (code: string) => {
      if (!Object.keys(rooms).includes(code)) {
        console.warn(`Room with code: ${code} does not exist`);
        return;
      }
      if (rooms[code].length >= maxClients) {
        console.warn(`Room with code: ${code} is full`);
        return;
      }
      rooms[code].push(ws);
      ws["room"] = code;
      sendInformation(ws);
    };

    const leave = () => {
      const room = ws["room"];
      rooms[room] = rooms[room].filter((client) => client !== ws);
      ws["room"] = undefined;
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    };
  });
};
