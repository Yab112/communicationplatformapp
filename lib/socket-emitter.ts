// lib/socket-emitter.ts
"use server";

// A strongly-typed interface for the data our emitter will send
interface EmitData {
  event: string;  // The name of the event (e.g., "notification", "new-message")
  room: string;     // The room to send it to (e.g., "user:123", "chatroom:abc")
  payload: string | Record<string, any>;   // The data to send
}

export async function emitSocketEvent({ event, room, payload }: EmitData) {
  try {
    // Construct the full URL to your standalone socket server's internal API
    const socketApiUrl = `http://localhost:${process.env.SOCKET_PORT || 3001}/api/emit`;
    
    // Use fetch to send a POST request from the Next.js server to the Socket.IO server
    const response = await fetch(socketApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, room, payload }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Failed to emit socket event to the standalone server:", errorBody);
    }

  } catch (error) {
    // This will catch network errors if the socket server is down
    console.error("Error emitting socket event:", error);
  }
}