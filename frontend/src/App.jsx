import { useState, useEffect } from "react";
import AudioVisualizer from "./components/AudioVisualizer";
import logo from "./assets/logo.png";
import mainasset from "./assets/mainasset.gif";

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
      const data = JSON.parse(event.data);
      console.log("Data: ", data);
      const newAngle = data.angle !== undefined ? data.angle : null;

      setCurrentAngle((prevAngle) =>
        newAngle !== null ? newAngle : prevAngle,
      );
      setTranscriptionText((prevTranscription) => {
        return prevTranscription + "\n" + (data.transcript || "");
      });
      setMessages((prevMessages) => [...prevMessages, data]);
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
      <img src={logo} alt="Tritone" className="w-72 h-auto mb-4" />
      {!transcriptionOn && (
        <img src={mainasset} alt="asset" className="w-96 h-auto mb-6" />
      )}

      {/* Mode Selection */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <label htmlFor="mode" className="text-lg font-medium">
            Select Mode
          </label>
          <select
            id="mode"
            value={mode}
            onChange={handleModeChange}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-center"
          >
            <option value="nearby">Nearby</option>
            <option value="long-distance">Long-Distance</option>
          </select>
        </div>

        {/* Transcription Toggle Button */}
        <button
          onClick={toggleTranscription}
          className={`px-6 py-2 rounded-md font-semibold text-white ${
            transcriptionOn
              ? "bg-[#ff3c8a] hover:[#d9296f]"
              : "bg-[#70af70] hover:bg-green-600"
          }`}
        >
          {transcriptionOn ? "Stop Transcription" : "Start Transcription"}
        </button>
      </div>

      {/* Render the Audio Visualizer when transcription starts */}
      {transcriptionOn && (
        <div className="mt-6">
          <AudioVisualizer currentAngle={currentAngle} setCurrentAngle={setCurrentAngle}/>
        </div>
      )}

      {/* Transcription Box */}
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
