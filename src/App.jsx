import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./Pages/MainPage/MainPage";
import MockPart2 from "./Pages/Mock/Part2/MockPart2";
import Part2Exam from "./Pages/Mock/Part2/Part2Exam";
import Part2Template from "./Pages/Mock/Part2/Part2Template";
import Part2Generator from "./Pages/Practice/Part2Generator";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* 라우팅 영역 */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/mock/part2" element={<MockPart2 />} />
        <Route path="/mock/part2/exam" element={<Part2Exam />} />
        <Route path="/mock/part2/template" element={<Part2Template />} />
        <Route path="/practice" element={<Part2Generator />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;