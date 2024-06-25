import { Server } from "http";
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

interface BasicMessage {
  type: "leave" | "search" | "create";
}

interface JoinParams {
  code: string;
  userId: string;
}

interface JoinMessage {
  type: "join";
  params: JoinParams;
}

interface InitMessage {
  type: "init";
  params: { userId: string };
}

type Message = JoinMessage | BasicMessage | InitMessage;

const maxClients = 2;
let rooms: { [key: string]: WebSocket[] } = {};

const sendInformation = (ws: WebSocket) => {
  let obj;
  if (ws["room"])
    obj = {
      type: "connected",
      params: {
        room: ws["room"],
        userIds: rooms[ws["room"]].map((client) => client["userId"]),
      },
    };
  else if (rooms[ws["room"]])
    obj = { type: "full", params: { room: "room full" } };
  else obj = { type: "error", params: { room: "no room" } };

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
        case "search":
          search();
          break;
        case "init":
          init(msg.params.userId);
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

    const search = () => {
      const result = Object.entries(rooms).find(
        ([key, value]) => value.length < maxClients
      );
      if (result) {
        const [key, value] = result;
        rooms[key].push(ws);
        ws["room"] = key;
        sendInformation(ws);
      } else {
        create();
      }
    };

    const init = (userId: string) => {
      ws["userId"] = userId;
    };
  });
};
