// types.ts
export interface SimulationParams {
    walletCount: number;
    riskyWalletCount: number;
    transactionCount: number;
    dampingFactor?: number; // Optional for algorithm settings
    iterations?: number; // Optional for algorithm settings
    riskThreshold?: number; // Optional for risk analysis
    allowRiskDecay?: boolean; // Optional for risk decay
    transactionWeight?: number; // Optional for transaction weight
  }
  
  export interface Wallet {
    id: string;
    position: [number, number, number];
    riskScore: number;
    color: string;
  }
  
  export interface Transaction {
    source: string;
    target: string;
    startTime: number;
    endTime: number;
    color: string;
  }