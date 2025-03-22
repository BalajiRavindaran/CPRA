// api.ts
import { SimulationParams } from './types';

// Define the base URL for the API
const BASE_URL = 'http://localhost:3000';

export const api = {
  // Wallets API
  getWallets: async () => {
    const response = await fetch(`${BASE_URL}/wallets`);
    if (!response.ok) throw new Error('Failed to fetch wallets');
    return response.json();
  },

  createWallets: async (params: { walletCount: number; riskyWalletCount: number }) => {
    const response = await fetch(`${BASE_URL}/create-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to create wallets');
    return response.json();
  },

  getWalletDetails: async (walletId: string) => {
    const response = await fetch(`${BASE_URL}/wallets/${walletId}`);
    if (!response.ok) throw new Error('Failed to fetch wallet details');
    return response.json();
  },

  // Transactions API
  getTransactions: async () => {
    const response = await fetch(`${BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  simulateTransactions: async (params: SimulationParams) => {
    const response = await fetch(`${BASE_URL}/simulate-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to simulate transactions');
    return response.json();
  },

  // Add more API methods as needed
};