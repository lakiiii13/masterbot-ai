import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrustveneMareze from "./components/DrustveneMareze.jsx";
import FacebookObjava from "./components/FacebookObjava.jsx";
import InstagramObjava from "./components/InstagramObjava.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DrustveneMareze />} />
        <Route path="/alati/facebook-objava" element={<FacebookObjava />} />
        <Route path="/alati/instagram-objava" element={<InstagramObjava />} />
      </Routes>
    </BrowserRouter>
  );
}
