import { BrowserRouter, Routes, Route } from "react-router-dom";
import FacebookLanding from "./components/FacebookLanding.jsx";
import FacebookObjava from "./components/FacebookObjava.jsx";
import InstagramObjava from "./components/InstagramObjava.jsx";

export default function App() {
  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; background: #090b11; }
        * { box-sizing: border-box; }
        @media (max-width: 640px) {
          body { -webkit-tap-highlight-color: transparent; }
        }
      `}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FacebookLanding />} />
          <Route path="/facebook-objava" element={<FacebookObjava />} />
          <Route path="/instagram-objava" element={<InstagramObjava />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
