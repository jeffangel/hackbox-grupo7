import React from "react";
import { JobDataProvider } from "./contexts/JobDataContext.js";
import ConnectApp from "./pages/ConnectApp.jsx";

function App() {
  
  return (
    <JobDataProvider>
      <ConnectApp />
    </JobDataProvider>
  );
}

export default App;
