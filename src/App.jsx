// src/index.tsx
import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import RedirectApp from "./RedirectApp";

export default function Home() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectApp />} />
        <Route path="/share/:id" element={<RedirectApp />} />
        <Route path="/forget/:id" element={<RedirectApp />} />
      </Routes>
    </BrowserRouter>
  );
}
