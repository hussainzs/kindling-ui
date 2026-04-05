import { RouterProvider } from "react-router";
import { appRouter } from "../routes/appRouter";
import "./index.css";

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;