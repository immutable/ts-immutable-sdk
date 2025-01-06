import React, { createContext, useContext } from 'react';

export interface Migration {
  id: number;
  x_collection_address: string;
  zkevm_collection_address: string;
  token_id: string;
  zkevm_wallet_address: string;
  status: string;
  burn_id: string | null;
  created_at: string;
  updated_at: string;
}

interface BackendContextType {
  fetchStagedAssets: () => Promise<Migration[]>;
  stageAssets: (migrationReqs: { zkevm_wallet_address: string; token_id: string }[]) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiURL = 'http://localhost:3001/migrations';

  const fetchStagedAssets = async (): Promise<Migration[]> => {
    try {
      const response = await fetch(apiURL);
      if (response.ok) {
        const data = await response.json();
        return data as Migration[];
      } else {
        console.error('Failed to fetch staged assets');
        return [];
      }
    } catch (error) {
      console.error('Error fetching staged assets:', error);
      return [];
    }
  };

  const stageAssets = async (migrationReqs: { zkevm_wallet_address: string; token_id: string }[]) => {
    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ migrationReqs }),
      });

      if (!response.ok) {
        throw new Error('Failed to stage assets');
      }
    } catch (error) {
      console.error('Error staging assets:', error);
    }
  };

  return (
    <BackendContext.Provider value={{ fetchStagedAssets, stageAssets }}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
}; 