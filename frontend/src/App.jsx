import { useState, useEffect } from "react";
import AudioVisualizer from "./components/AudioVisualizer";

const App = () => {
  const [mode, setMode] = useState("nearby");
  const [transcriptionOn, setTranscriptionOn] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [currentAngle, setCurrentAngle] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      // console.log(event.data)
      const data = JSON.parse(event.data);
      console.log("Data: ", data)
      const angle = data.angle !== undefined ? data.angle : 0;
      const transcription = data.transcript || "";
      console.log(transcription)
      setTranscriptionText((prevTranscription) => prevTranscription + "\n" + transcription);
      setCurrentAngle(angle);
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

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  const toggleTranscription = () => {
    setTranscriptionOn((prev) => !prev);
    if (!transcriptionOn) {
      // Simulate transcription (replace with backend integration)
      setTranscriptionText("Transcription will appear here...");
    } else {
      setTranscriptionText("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4">HearR</h1>

      {/* Mode Selection */}
      <div className="flex flex-col items-center space-y-4">
        <div>
          <label htmlFor="mode" className="block text-lg font-medium mb-1">
            Select Mode
          </label>
          <select
            id="mode"
            value={mode}
            onChange={handleModeChange}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          >
            <option value="nearby">Nearby</option>
            <option value="long-distance">Long Distance</option>
          </select>
        </div>

        {/* Transcription Toggle Button */}
        <button
          onClick={toggleTranscription}
          className={`px-6 py-2 rounded-md font-semibold text-white ${
            transcriptionOn
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {transcriptionOn ? "Stop Transcription" : "Start Transcription"}
        </button>
      </div>

      {transcriptionOn && (
        <div className="mt-6">
          <AudioVisualizer />
        </div>
      )}

      {transcriptionOn && (
        <div className="w-full max-w-3xl p-4 bg-white border rounded-lg shadow mt-6">
          <p className="text-sm text-gray-500">Transcription:</p>
          <div className="mt-2 p-2 h-40 overflow-y-auto border rounded bg-gray-100">
            {transcriptionText || "No transcription yet..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
