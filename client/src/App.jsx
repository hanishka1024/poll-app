import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreatePoll from "./pages/CreatePoll";
import PollView from "./pages/PollView";
import PollAnalytics from "./pages/PollAnalytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<PollView />} />
        <Route path="/poll/:id/analytics" element={<PollAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;
