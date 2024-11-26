import { type Root, createRoot } from "react-dom/client";
// import { RuntimeLoader } from "@rive-app/react-canvas-lite";
// import riveWasmUrl from "@rive-app/canvas-lite/rive.wasm";

import { App } from "./App";

// RuntimeLoader.setWasmUrl(riveWasmUrl);

const rootDom = document.getElementById("app");
let root: Root | null = null;
if (rootDom) {
  root = createRoot(rootDom);
  root?.render(
    <>
      {/* <link
        rel="preload"
        href={riveWasmUrl}
        as="fetch"
        crossOrigin="anonymous"
      /> */}
      <App />
    </>,
  );
}
