import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initBrand } from "@/lib/brand-theme";

// Apply the active brand theme + favicon from content before first paint.
initBrand();

createRoot(document.getElementById("root")!).render(<App />);
