import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Observations from "./pages/Observations";
import Chuck from "./pages/Chuck";
import NoPage from "./pages/NoPage";
import User from "./pages/User";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="observations" element={<Observations />} />
          <Route path='users/:id' element={<User />} />
          <Route path='chuck' element={<Chuck />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);