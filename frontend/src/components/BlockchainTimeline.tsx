import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Transaction {
  id: string;
  timestamp: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  riskScore: number;
  status: "confirmed" | "pending" | "flagged";
}

interface BlockchainTimelineProps {
  transactions?: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

const BlockchainTimeline = ({
  transactions = [
    {
      id: "tx-001",
      timestamp: "2023-06-15 14:32:45",
      fromWallet: "0x8f7d...e5a2",
      toWallet: "0x3a9c...b7d1",
      amount: 1.25,
      riskScore: 78,
      status: "confirmed" as const,
    },
    {
      id: "tx-002",
      timestamp: "2023-06-15 14:30:12",
      fromWallet: "0x2b5e...c8f3",
      toWallet: "0x8f7d...e5a2",
      amount: 0.5,
      riskScore: 45,
      status: "confirmed" as const,
    },
    {
      id: "tx-003",
      timestamp: "2023-06-15 14:28:33",
      fromWallet: "0x6d1a...f4e7",
      toWallet: "0x2b5e...c8f3",
      amount: 3.75,
      riskScore: 22,
      status: "confirmed" as const,
    },
    {
      id: "tx-004",
      timestamp: "2023-06-15 14:25:18",
      fromWallet: "0x3a9c...b7d1",
      toWallet: "0x7f2c...a9e5",
      amount: 2.0,
      riskScore: 85,
      status: "flagged" as const,
    },
    {
      id: "tx-005",
      timestamp: "2023-06-15 14:22:51",
      fromWallet: "0x9e4b...d2c6",
      toWallet: "0x6d1a...f4e7",
      amount: 0.75,
      riskScore: 30,
      status: "confirmed" as const,
    },
    {
      id: "tx-006",
      timestamp: "2023-06-15 14:20:07",
      fromWallet: "0x7f2c...a9e5",
      toWallet: "0x9e4b...d2c6",
      amount: 1.5,
      riskScore: 60,
      status: "pending" as const,
    },
    {
      id: "tx-007",
      timestamp: "2023-06-15 14:18:22",
      fromWallet: "0x1d8b...e3f5",
      toWallet: "0x8f7d...e5a2",
      amount: 5.0,
      riskScore: 90,
      status: "flagged" as const,
    },
    {
      id: "tx-008",
      timestamp: "2023-06-15 14:15:39",
      fromWallet: "0x5c7a...b2d8",
      toWallet: "0x1d8b...e3f5",
      amount: 0.25,
      riskScore: 15,
      status: "confirmed" as const,
    },
    {
      id: "tx-009",
      timestamp: "2023-06-15 14:12:44",
      fromWallet: "0x8f7d...e5a2",
      toWallet: "0x5c7a...b2d8",
      amount: 1.75,
      riskScore: 55,
      status: "confirmed" as const,
    },
    {
      id: "tx-010",
      timestamp: "2023-06-15 14:10:11",
      fromWallet: "0x3a9c...b7d1",
      toWallet: "0x8f7d...e5a2",
      amount: 2.5,
      riskScore: 70,
      status: "pending" as const,
    },
  ],
  onTransactionClick = () => {},
}: BlockchainTimelineProps) => {
  const [filter, setFilter] = useState<"all" | "high-risk" | "flagged">("all");
  const [expanded, setExpanded] = useState(true);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "high-risk") return tx.riskScore >= 75;
    if (filter === "flagged") return tx.status === "flagged";
    return true;
  });

  const getRiskColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background border-t border-border">
      <div className="container mx-auto py-4 px-2 md:px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="p-1"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <h2 className="text-xl font-semibold">Blockchain Timeline</h2>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Tabs
              defaultValue="all"
              className="w-full max-w-[300px]"
              onValueChange={(value) => setFilter(value as any)}
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high-risk">High Risk</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {expanded && (
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Showing {filteredTransactions.length} transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4 custom-scrollbar">
                <div className="space-y-4">
                  {filteredTransactions.map((transaction, index) => (
                    <div key={transaction.id} className="relative">
                      {index > 0 && (
                        <div className="absolute left-6 top-0 h-full w-0.5 -mt-4 bg-border"></div>
                      )}
                      <div
                        className="flex items-start p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer relative z-10 bg-background"
                        onClick={() => onTransactionClick(transaction)}
                      >
                        <div className="flex-shrink-0 mr-4 bg-muted rounded-full p-2">
                          <Clock className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium">
                              {transaction.id}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {transaction.timestamp}
                              </span>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(transaction.status)}
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm mb-2">
                            <span className="font-mono text-xs truncate max-w-[120px]">
                              {transaction.fromWallet}
                            </span>
                            <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                            <span className="font-mono text-xs truncate max-w-[120px]">
                              {transaction.toWallet}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {transaction.amount} ETH
                            </span>
                            <Badge
                              className={`${getRiskColor(transaction.riskScore)} text-white text-xs`}
                            >
                              Risk: {transaction.riskScore}/100
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlockchainTimeline;
