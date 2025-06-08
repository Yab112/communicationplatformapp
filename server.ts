// server.ts (Final, Corrected Version with Graceful Shutdown)
import { createServer, IncomingMessage, ServerResponse } from "http";
import { initSocketServer, getSocketServer } from "./lib/socket-server";

const PORT = process.env.SOCKET_PORT || 3001;

// This function handles incoming HTTP requests to our standalone server
const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  // We only care about POST requests to our specific internal API route
  if (req.url === "/api/emit" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { event, room, payload } = JSON.parse(body);
        if (event && room && payload) {
          const io = getSocketServer();
          io.to(room).emit(event, payload);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } else {
          throw new Error("Invalid event data.");
        }
      } catch (error: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    // For any other request, return 404 Not Found
    res.writeHead(404);
    res.end();
  }
};

const httpServer = createServer(requestListener);

// Initialize Socket.IO and store the instance in the 'io' constant
const io = initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server with API endpoint is running on port: ${PORT}`);
});

// --- ADD THIS BLOCK FOR GRACEFUL SHUTDOWN ---
// This properly uses the 'io' constant, which will remove the error.
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing server gracefully.");
  io.close(() => {
    console.log("Socket.IO server closed.");
    httpServer.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  });
});