// api.ts
import { SimulationParams } from './types';

// Define the base URL for the API
const BASE_URL = 'http://localhost:3000';

// Generate or retrieve the user_id
const getUserId = () => {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = crypto.randomUUID().substring(0, 8); // Generate a shorter UUID (8 characters)
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

export const api = {
  createWallets: async (params: { walletCount: number; riskyWalletCount: number; allowRiskDecay?: boolean }) => {
    const response = await fetch(`${BASE_URL}/wallets/create-wallets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-ID': getUserId(), // Include the user_id in the headers
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to create wallets');
    return response.json();
  },

  getAllWallets: async () => {
    const response = await fetch(`${BASE_URL}/wallets`, {
      headers: { 
        'X-User-ID': getUserId(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch wallets');
    return response.json();
  },

  getWalletDetails: async (walletId: string) => {
    const response = await fetch(`${BASE_URL}/wallets/${walletId}`, {
      headers: {
        'X-User-ID': getUserId(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch wallet details');
    return response.json();
  },

  // Transactions APIs
  getTransactions: async () => {
    const response = await fetch(`${BASE_URL}/transactions`, {
      headers: { 
        'X-User-ID': getUserId(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  simulateTransactions: async (params: SimulationParams) => {
    const response = await fetch(`${BASE_URL}/transactions/simulate-transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-ID': getUserId(),
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to simulate transactions');
    return response.json();
  },

  // Add more API methods as needed
};