"use client";

import React, { useState, useEffect } from "react";
import { ApiClient, PaymentTransaction } from "@/lib/api";
import { 
  CreditCard, 
  ArrowLeft, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await ApiClient.getPaymentHistory();
        setTransactions(data.payment_history);
      } catch (err) {
        console.error("Failed to fetch payment history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownload = async (txId: number) => {
    setDownloading(txId);
    try {
      const blob = await ApiClient.downloadPaymentReceipt(txId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${txId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download receipt");
    } finally {
      setDownloading(null);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.payment_type.toLowerCase().includes(search.toLowerCase()) ||
    tx.reference_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold animate-pulse">Retrieving your financial records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Content Section */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search by payment type or reference ID..." 
                className="pl-12 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="grid gap-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <Card 
                  key={tx.id} 
                  className="bg-white border-slate-100 hover:border-purple-200 transition-all duration-300 p-5 group shadow-sm hover:shadow-xl hover:shadow-purple-500/5 rounded-2xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${
                        tx.status === 'completed' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-black text-slate-800 uppercase text-sm tracking-wide">{tx.payment_type.replace('_', ' ')}</h3>
                          {tx.status === 'completed' ? (
                            <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-green-100">
                              <CheckCircle2 size={10} /> Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-amber-100">
                              <Clock size={10} /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-bold tracking-tight">Ref: {tx.reference_id || 'PCU-T-XXXXXX'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-tight">₦{tx.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {tx.completed_at ? format(new Date(tx.completed_at), "MMM d, yyyy · HH:mm") : 'Processing...'}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handleDownload(tx.id)}
                        disabled={downloading === tx.id || tx.status !== 'completed'}
                        variant="outline"
                        className="rounded-xl border-slate-200 hover:bg-purple-50 hover:text-purple-600 transition-colors h-11 px-6 font-bold"
                      >
                         {downloading === tx.id ? (
                           <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                           <Download size={18} className="mr-2" />
                         )}
                         Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                <CreditCard className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No transactions found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Your payment history will appear here once you make your first payment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
