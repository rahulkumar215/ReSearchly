import { Button } from "@/components/ui/button";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PromptPage from "./pages/PromptPage";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<LandingPage />} /> */}
      <Route path="/" element={<PromptPage />} />
    </Routes>
  );
}

export default App;
