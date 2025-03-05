import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RiskHistoryItem {
  date: string;
  score: number;
  change: "increase" | "decrease" | "stable";
  transaction: string;
}

interface WalletDetailPopupProps {
  walletId?: string;
  currentRiskScore?: number;
  riskHistory?: RiskHistoryItem[];
  position?: { x: number; y: number };
  onClose?: () => void;
  isOpen?: boolean;
}

const WalletDetailPopup = ({
  walletId = "0x8f7d...e5a2",
  currentRiskScore = 78,
  riskHistory = [
    {
      date: "2023-06-15 14:32",
      score: 78,
      change: "increase",
      transaction: "Tx0x45a2...b3c7",
    },
    {
      date: "2023-06-14 09:17",
      score: 65,
      change: "increase",
      transaction: "Tx0x72f1...a9d3",
    },
    {
      date: "2023-06-12 18:45",
      score: 52,
      change: "stable",
      transaction: "Tx0x31e8...c4b2",
    },
    {
      date: "2023-06-10 11:23",
      score: 52,
      change: "decrease",
      transaction: "Tx0x93a7...f1d5",
    },
    {
      date: "2023-06-08 16:09",
      score: 60,
      change: "increase",
      transaction: "Tx0x12d9...e7a4",
    },
  ],
  position = { x: 50, y: 50 },
  onClose = () => {},
  isOpen = true,
}: WalletDetailPopupProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const getRiskColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      className="fixed z-50 bg-background border rounded-lg shadow-lg w-[90vw] md:w-[400px] max-h-[350px] overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        maxWidth: "calc(100vw - 20px)",
      }}
    >
      <Card className="border-0 shadow-none h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">
              Wallet Details
            </CardTitle>
            <p className="text-sm text-muted-foreground">{walletId}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Risk Score</span>
              <Badge className={`${getRiskColor(currentRiskScore)} text-white`}>
                {currentRiskScore}/100
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`${getRiskColor(currentRiskScore)} h-2.5 rounded-full`}
                style={{ width: `${currentRiskScore}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Risk History</h3>
            <div className="max-h-[180px] overflow-y-auto pr-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="text-right">Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs">{item.date}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRiskColor(item.score)} text-white text-xs`}
                        >
                          {item.score}
                        </Badge>
                      </TableCell>
                      <TableCell>{getChangeIcon(item.change)}</TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {item.transaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDetailPopup;
