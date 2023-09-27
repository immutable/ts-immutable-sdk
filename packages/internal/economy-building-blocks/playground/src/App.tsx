import React from 'react';
import { BiomeThemeProvider, BiomeCombinedProviders } from '@biom3/react';
import { onDarkBase } from '@biom3/design-tokens';
import Header from './components/Header';
import { PassportProvider } from './context/PassportProvider';
import { DataProvider } from './context/DataProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Container from './components/Container';
import Crafting from './pages/Crafting';
import PrimarySale from './pages/PrimarySale';
import Login from './pages/Login';
import { MulticallerProvider } from './context/MulticallerProvider';
import { MetamaskProvider } from './context/MetamaskProvider';
import PrimaryRevenueWidget from './pages/PrimaryRevenueWidget';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <MulticallerProvider>
          <MetamaskProvider>
            <PassportProvider>
              <BiomeCombinedProviders>
                <BiomeThemeProvider theme={{ base: onDarkBase }}>
                  <div className="App">
                    <Container>
                      <Routes>
                        <Route path="/sale" element={<PrimarySale />} />
                        <Route
                          path="/mint-sale"
                          element={<PrimaryRevenueWidget />}
                        />
                        <Route path="/crafting" element={<Crafting />} />
                        <Route path="/login" element={<Login />} />
                      </Routes>
                    </Container>
                  </div>
                </BiomeThemeProvider>
              </BiomeCombinedProviders>
            </PassportProvider>
          </MetamaskProvider>
        </MulticallerProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
