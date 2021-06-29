import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import UploadImages from "./components/image-upload.component";

function App() {
  return (
    <div className="container">
      <h4>Rose Colored Glasses</h4>

      <div className="content">
        <UploadImages />
      </div>
    </div>
  );
}

export default App;
