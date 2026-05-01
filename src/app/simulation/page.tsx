"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const STOCKS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "TSLA", name: "Tesla" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const TRANSACTION_COST = 2.5;

interface Holding {
  qty: number;
  avgPrice: number;
}

interface Trade {
  type: string;
  stock: string;
  qty: number;
  price: number;
  cost: number;
  time: string;
}

export default function Simulation() {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, number>>({
    AAPL: 175, GOOGL: 140, BTC: 250, TSLA: 200
  });
  const [balance, setBalance] = useState(10000);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [history, setHistory] = useState<Trade[]>([]);
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState("AAPL");

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated: Record<string, number> = {};
        STOCKS.forEach(s => {
          updated[s.symbol] = parseFloat(
            (prev[s.symbol] + (Math.random() - 0.5) * 10).toFixed(2)
          );
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = () => {
    const price = prices[selected];
    const total = price * qty + TRANSACTION_COST;
    if (balance < total) return alert("Insufficient balance!");
    setBalance(prev => parseFloat((prev - total).toFixed(2)));
    setHoldings(prev => ({
      ...prev,
      [selected]: {
        qty: (prev[selected]?.qty || 0) + qty,
        avgPrice: price
      }
    }));
    setHistory(prev => [{
      type: "BUY", stock: selected,
      qty, price, cost: TRANSACTION_COST,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const handleSell = () => {
    if (!holdings[selected] || holdings[selected].qty < qty)
      return alert("Not enough shares!");
    const price = prices[selected];
    const total = price * qty - TRANSACTION_COST;
    setBalance(prev => parseFloat((prev + total).toFixed(2)));
    setHoldings(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        qty: prev[selected].qty - qty
      }
    }));
    setHistory(prev => [{
      type: "SELL", stock: selected,
      qty, price, cost: TRANSACTION_COST,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const portfolioValue = Object.entries(holdings).reduce(
    (sum, [sym, h]) => sum + h.qty * (prices[sym] || 0), 0
  );
  const totalPnL = parseFloat((portfolioValue + balance - 10000).toFixed(2));

  const pieData = Object.entries(holdings)
    .filter(([, h]) => h.qty > 0)
    .map(([sym, h]) => ({
      name: sym,
      value: parseFloat((h.qty * prices[sym]).toFixed(2))
    }));

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "white" }}>
      {/* Navbar */}
      <div style={{
        background: "#0d1b2a", padding: "16px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", borderBottom: "1px solid #1a2a3a"
      }}>
        <h1 style={{ color: "#00d4ff", fontSize: "22px" }}>📈 TradePro</h1>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "#1a2a3a", color: "#00d4ff",
          border: "1px solid #00d4ff", padding: "8px 20px",
          borderRadius: "8px", cursor: "pointer"
        }}>← Dashboard</button>
      </div>

      <div style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "26px", marginBottom: "24px" }}>
          💰 Portfolio Simulation
        </h2>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", marginBottom: "24px"
        }}>
          {[
            { label: "💵 Balance", value: `$${balance.toLocaleString()}`, color: "#00d4ff" },
            { label: "📊 Portfolio Value", value: `$${portfolioValue.toFixed(2)}`, color: "#00C49F" },
            { label: "📈 Total P&L", value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL}`, color: totalPnL >= 0 ? "#00C49F" : "#FF8042" }
          ].map((s, i) => (
            <div key={i} style={{
              background: "#0d1b2a", padding: "20px",
              borderRadius: "12px", textAlign: "center",
              border: "1px solid #1a2a3a"
            }}>
              <p style={{ color: "#888", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "bold", color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Stock Selector */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px", marginBottom: "24px"
        }}>
          {STOCKS.map((s, i) => (
            <div key={s.symbol} onClick={() => setSelected(s.symbol)} style={{
              background: selected === s.symbol ? "#1a3a5a" : "#0d1b2a",
              padding: "16px", borderRadius: "12px", textAlign: "center",
              cursor: "pointer",
              border: `2px solid ${selected === s.symbol ? "#00d4ff" : "#1a2a3a"}`
            }}>
              <p style={{ color: COLORS[i], fontWeight: "bold" }}>{s.symbol}</p>
              <p style={{ fontSize: "18px" }}>${prices[s.symbol]}</p>
              <p style={{ color: "#888", fontSize: "12px" }}>
                Holding: {holdings[s.symbol]?.qty || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Trade Section */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "12px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>
            Trade {selected} @ ${prices[selected]}
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input type="number" min="1" value={qty}
              onChange={e => setQty(Number(e.target.value))}
              style={{
                padding: "10px", borderRadius: "8px",
                border: "1px solid #1a2a3a",
                background: "#1a2a3a", color: "white", width: "100px"
              }} />
            <button onClick={handleBuy} style={{
              padding: "10px 24px", background: "#00C49F",
              color: "#000", border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>🟢 Buy</button>
            <button onClick={handleSell} style={{
              padding: "10px 24px", background: "#FF8042",
              color: "#000", border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>🔴 Sell</button>
          </div>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}>
            Transaction cost: ${TRANSACTION_COST} per trade
          </p>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div style={{
            background: "#0d1b2a", padding: "24px",
            borderRadius: "12px", marginBottom: "24px",
            border: "1px solid #1a2a3a"
          }}>
            <h3 style={{ marginBottom: "16px" }}>🥧 Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1b2a" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trade History */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "12px", border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>📜 Trade History</h3>
          {history.length === 0 ? (
            <p style={{ color: "#888" }}>No trades yet — start buying!</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1a2a3a" }}>
                  {["Type", "Stock", "Qty", "Price", "Fee", "Time"].map(h => (
                    <th key={h} style={{
                      padding: "10px", textAlign: "left", color: "#00d4ff"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1a2a3a" }}>
                    <td style={{
                      padding: "10px",
                      color: t.type === "BUY" ? "#00C49F" : "#FF8042",
                      fontWeight: "bold"
                    }}>{t.type}</td>
                    <td style={{ padding: "10px" }}>{t.stock}</td>
                    <td style={{ padding: "10px" }}>{t.qty}</td>
                    <td style={{ padding: "10px" }}>${t.price}</td>
                    <td style={{ padding: "10px" }}>${t.cost}</td>
                    <td style={{ padding: "10px", color: "#888" }}>{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}