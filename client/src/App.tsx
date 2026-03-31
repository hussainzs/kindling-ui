import { Camera, Home } from "lucide-react";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-indigo-600">App is running with tailwind</h1>
      <Camera className="text-indigo-600 w-8 h-8" />
      <Home className="text-indigo-600 w-8 h-8" />
    </div>
  );
}

export default App;