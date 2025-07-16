import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Boilerplate } from "./Boilerplate";
import reportWebVitals from "./reportWebVitals";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "components/ErrorFallback/ErrorFallback";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Optional: Add any reset logic here
        window.location.reload();
      }}
    >
      <Boilerplate />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
