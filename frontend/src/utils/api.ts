// api.ts
import { SimulationParams } from './types';

// Define the base URL for the API
const BASE_URL = 'http://localhost:3000';

export const api = {
  createWallets: async (params: { walletCount: number; riskyWalletCount: number; allowRiskDecay?: boolean }) => {
    const response = await fetch(`${BASE_URL}/wallets/create-wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to create wallets');
    return response.json();
  },

  getAllWallets: async () => {
    const response = await fetch(`${BASE_URL}/wallets`);
    if (!response.ok) throw new Error('Failed to fetch wallets');
    return response.json();
  },

  getWalletDetails: async (walletId: string) => {
    const response = await fetch(`${BASE_URL}/wallets/${walletId}`);
    if (!response.ok) throw new Error('Failed to fetch wallet details');
    return response.json();
  },

  // Transactions APIs
  getTransactions: async () => {
    const response = await fetch(`${BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  simulateTransactions: async (params: SimulationParams) => {
    const response = await fetch(`${BASE_URL}/transactions/simulate-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to simulate transactions');
    return response.json();
  },

  // Add more API methods as needed
};