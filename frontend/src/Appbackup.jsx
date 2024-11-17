/*
import { useState, useEffect } from "react";
import Test from "./components/Test";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event.reason);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.send(input.trim());
      setInput(""); // Clear input field
    } else {
      console.error("Cannot send empty message or socket not ready");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <Test />
      <h1>WebSocket Client</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Messages</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "200px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
*/