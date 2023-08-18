import { Routes, Route } from "react-router-dom";
import ProjectDetails from "./pages/ProjectDetails";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="projectdetails" element={<ProjectDetails />} />
      </Routes>
    </>
  );
}

export default App;
