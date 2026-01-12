"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Plus,
  RefreshCw,
  Copy,
  LogOut,
  CreditCard,
  Ban,
} from "lucide-react";

interface CardCode {
  id: string;
  code: string;
  amount: string;
  status: string;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PRESET_AMOUNTS = [10, 20, 50, 100, 200, 500];
const MIN_AMOUNT = 10;

export default function AdminCardsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generate card form
  const [amount, setAmount] = useState("10");
  const [count, setCount] = useState("1");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Card list
  const [cards, setCards] = useState<CardCode[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");

  // Check login status
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin");
      return;
    }
    setToken(adminToken);
  }, [router]);

  // Load card list
  const loadCards = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/admin/cards?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin");
        return;
      }

      const data = await response.json();
      setCards(data.cardCodes || []);
      setPagination(prev => data.pagination || prev);
    } catch (error) {
      console.error("Load cards error:", error);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, statusFilter, router]);

  useEffect(() => {
    if (token) {
      loadCards();
    }
  }, [token, loadCards]);

  // Generate cards
  async function handleGenerate() {
    if (!token) return;

    const numAmount = parseFloat(amount);
    const numCount = parseInt(count);

    if (!numAmount || numAmount < MIN_AMOUNT) {
      toast({ title: `Amount must be at least ¥${MIN_AMOUNT}`, variant: "destructive" });
      return;
    }

    if (!numCount || numCount < 1 || numCount > 100) {
      toast({ title: "Quantity must be between 1-100", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setGeneratedCodes([]);

    try {
      const response = await fetch("/api/admin/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: numAmount, count: numCount }),
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedCodes(data.codes);
      toast({
        title: "Generated Successfully",
        description: data.message,
      });

      // Refresh list
      loadCards();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  // Copy card code
  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: code });
  }

  // Copy all codes
  function copyAllCodes() {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast({ title: "All codes copied" });
  }

  // Disable card
  async function handleDisable(cardId: string) {
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/cards?id=${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Disable failed");
      }

      toast({ title: "Card disabled" });
      loadCards();
    } catch (error) {
      toast({
        title: "Disable Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  }

  // Status badge
  function getStatusBadge(status: string) {
    switch (status) {
      case "unused":
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">Unused</Badge>;
      case "used":
        return <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Used</Badge>;
      case "disabled":
        return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Card Management</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Generate Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Amount (¥)</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === String(preset) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(String(preset))}
                    >
                      ¥{preset}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Custom amount (min ¥10)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={MIN_AMOUNT}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min={1}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">Max 100 per batch</p>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Cards
                </Button>
              </div>
            </div>

            {/* Generated Result */}
            {generatedCodes.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Generated {generatedCodes.length} cards successfully
                  </p>
                  <Button variant="outline" size="sm" onClick={copyAllCodes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {generatedCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700"
                    >
                      <code className="text-sm font-mono">{code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Card List</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unused">Unused</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={loadCards}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {loading ? "Loading..." : "No cards"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">{card.code}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCode(card.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>¥{parseFloat(card.amount).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(card.status)}</TableCell>
                        <TableCell>{card.usedBy || "-"}</TableCell>
                        <TableCell>
                          {new Date(card.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {card.status === "unused" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDisable(card.id)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Disable
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Total {pagination.total}, Page {pagination.page}/{pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
