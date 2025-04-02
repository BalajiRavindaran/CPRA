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

export interface RiskScoreHistory {
    _id: string;
    timestamp: string;
    previous_risk_score: number;
    risk_score: number;
    change: "up" | "down" | "neutral";
    transaction_id: string;
}

export interface Wallet {
    _id: string;
    id: string;
    position: [number, number, number];
    risk_score: number;
    color: string;
    balance: number;
    flagged: boolean;
    allowRiskDecay: boolean;
    transaction_history: string[];
    connected_wallets: string[];
    risk_score_history: RiskScoreHistory[];
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    _id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    risk: number;
    flagged: boolean;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    color?: string;
    startTime?: number;
    endTime?: number;
}