import React from "react";
import { BiomeThemeProvider, BiomeCombinedProviders } from "@biom3/react";
import { onDarkBase } from "@biom3/design-tokens";
import Header from "./components/Header";
import { PassportProvider } from "./context/PassportProvider";
import { DataProvider } from "./context/DataProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from "./components/Container";
import Crafting from "./pages/Crafting";
import Login from "./pages/Login";
import { MulticallerProvider } from "./context/MulticallerProvider";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <MulticallerProvider>
          <PassportProvider>
            <BiomeCombinedProviders>
              <BiomeThemeProvider theme={{ base: onDarkBase }}>
                <div className="App">
                  <Container>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Crafting />} />
                      <Route path="/login" element={<Login />} />
                    </Routes>
                  </Container>
                </div>
              </BiomeThemeProvider>
            </BiomeCombinedProviders>
          </PassportProvider>
        </MulticallerProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
