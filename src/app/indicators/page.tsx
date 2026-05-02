"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts";

interface DataPoint {
  day: string;
  price: number;
  ma20?: number;
  ma50?: number;
  upperBand?: number;
  lowerBand?: number;
  rsi?: number;
  signal?: string;
}

const generatePrices = (): number[] => {
  let price = 150;
  return Array.from({ length: 60 }, () => {
    price += (Math.random() - 0.5) * 10;
    return parseFloat(price.toFixed(2));
  });
};

const calcMA = (prices: number[], period: number, index: number): number => {
  if (index < period - 1) return 0;
  const slice = prices.slice(index - period + 1, index + 1);
  return parseFloat((slice.reduce((a, b) => a + b, 0) / period).toFixed(2));
};

const calcRSI = (prices: number[], index: number, period = 14): number => {
  if (index < period) return 50;
  const changes = prices.slice(index - period + 1, index + 1).map((p, i, arr) =>
    i === 0 ? 0 : p - arr[i - 1]
  );
  const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
  if (losses === 0) return 100;
  const rs = gains / losses;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
};

const calcBollinger = (prices: number[], index: number, period = 20) => {
  if (index < period - 1) return { upper: 0, lower: 0 };
  const slice = prices.slice(index - period + 1, index + 1);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return {
    upper: parseFloat((mean + 2 * std).toFixed(2)),
    lower: parseFloat((mean - 2 * std).toFixed(2))
  };
};

export default function Indicators() {
  const router = useRouter();
  const [prices, setPrices] = useState<number[]>(generatePrices());
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [buyThreshold, setBuyThreshold] = useState(30);
  const [sellThreshold, setSellThreshold] = useState(70);
  const [maPeriod, setMaPeriod] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(generatePrices());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const data: DataPoint[] = prices.slice(-30).map((price, i, arr) => {
    const globalIndex = prices.length - 30 + i;
    const ma20 = calcMA(prices, maPeriod, globalIndex);
    const ma50 = calcMA(prices, 50, globalIndex);
    const { upper, lower } = calcBollinger(prices, globalIndex);
    const rsi = calcRSI(prices, globalIndex);

    let signal = "";
    if (rsi < buyThreshold) signal = "BUY";
    else if (rsi > sellThreshold) signal = "SELL";
    else if (ma20 > 0 && price > ma20) signal = "HOLD ↑";
    else if (ma20 > 0 && price < ma20) signal = "HOLD ↓";

    return {
      day: `D${globalIndex + 1}`,
      price,
      ma20: ma20 || undefined,
      ma50: ma50 || undefined,
      upperBand: upper || undefined,
      lowerBand: lower || undefined,
      rsi,
      signal
    };
  });

  const latest = data[data.length - 1];
  const buySignals = data.filter(d => d.signal === "BUY").length;
  const sellSignals = data.filter(d => d.signal === "SELL").length;

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

      <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>
          📉 Custom Indicators & Strategies
        </h2>
        <p style={{ color: "#888", marginBottom: "24px" }}>
          🔄 Auto-updating every 5 seconds
        </p>

        {/* Live Signal Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px", marginBottom: "24px"
        }}>
          {[
            { label: "💰 Current Price", value: `$${latest?.price}`, color: "#00d4ff" },
            { label: "📊 RSI", value: latest?.rsi, color: latest?.rsi > sellThreshold ? "#FF8042" : latest?.rsi < buyThreshold ? "#00C49F" : "#FFBB28" },
            { label: "🟢 Buy Signals", value: buySignals, color: "#00C49F" },
            { label: "🔴 Sell Signals", value: sellSignals, color: "#FF8042" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#0d1b2a", padding: "20px",
              borderRadius: "12px", textAlign: "center",
              border: "1px solid #1a2a3a"
            }}>
              <p style={{ color: "#888", marginBottom: "8px", fontSize: "13px" }}>{s.label}</p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: s.color as string }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Strategy Settings */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>⚙️ Strategy Settings</h3>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "#888", marginBottom: "8px" }}>MA Period: {maPeriod}</p>
              <input type="range" min="5" max="50" value={maPeriod}
                onChange={e => setMaPeriod(Number(e.target.value))}
                style={{ width: "150px", accentColor: "#00d4ff" }} />
            </div>
            <div>
              <p style={{ color: "#888", marginBottom: "8px" }}>
                RSI Buy when below: {buyThreshold}
              </p>
              <input type="range" min="10" max="40" value={buyThreshold}
                onChange={e => setBuyThreshold(Number(e.target.value))}
                style={{ width: "150px", accentColor: "#00C49F" }} />
            </div>
            <div>
              <p style={{ color: "#888", marginBottom: "8px" }}>
                RSI Sell when above: {sellThreshold}
              </p>
              <input type="range" min="60" max="90" value={sellThreshold}
                onChange={e => setSellThreshold(Number(e.target.value))}
                style={{ width: "150px", accentColor: "#FF8042" }} />
            </div>
          </div>
        </div>

        {/* Indicator Toggles */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          {[
            { label: `MA${maPeriod}`, active: showMA20, toggle: () => setShowMA20(!showMA20), color: "#FFBB28" },
            { label: "MA50", active: showMA50, toggle: () => setShowMA50(!showMA50), color: "#0088FE" },
            { label: "Bollinger Bands", active: showBollinger, toggle: () => setShowBollinger(!showBollinger), color: "#FF8042" },
            { label: "RSI Signals", active: showRSI, toggle: () => setShowRSI(!showRSI), color: "#00C49F" },
          ].map((btn, i) => (
            <button key={i} onClick={btn.toggle} style={{
              padding: "8px 20px",
              background: btn.active ? btn.color : "#1a2a3a",
              color: btn.active ? "#000" : "#fff",
              border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>{btn.active ? "✅" : "❌"} {btn.label}</button>
          ))}
        </div>

        {/* Price Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>📈 Price & Indicators</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1a2a3a" }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const d = payload[0].payload as DataPoint;
                    return (
                      <div style={{
                        background: "#0d1b2a", padding: "12px",
                        borderRadius: "8px", border: "1px solid #1a2a3a"
                      }}>
                        <p style={{ color: "#00d4ff" }}>{d.day}</p>
                        <p>Price: ${d.price}</p>
                        {d.ma20 && <p style={{ color: "#FFBB28" }}>MA{maPeriod}: ${d.ma20}</p>}
                        {d.ma50 && <p style={{ color: "#0088FE" }}>MA50: ${d.ma50}</p>}
                        {d.rsi && <p style={{ color: "#00C49F" }}>RSI: {d.rsi}</p>}
                        {d.signal && (
                          <p style={{
                            color: d.signal === "BUY" ? "#00C49F" : d.signal === "SELL" ? "#FF8042" : "#888",
                            fontWeight: "bold", marginTop: "4px"
                          }}>Signal: {d.signal}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#00d4ff"
                strokeWidth={2} dot={false} name="Price" />
              {showMA20 && <Line type="monotone" dataKey="ma20" stroke="#FFBB28"
                strokeWidth={1.5} dot={false} name={`MA${maPeriod}`} strokeDasharray="5 5" />}
              {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#0088FE"
                strokeWidth={1.5} dot={false} name="MA50" strokeDasharray="5 5" />}
              {showBollinger && <>
                <Line type="monotone" dataKey="upperBand" stroke="#FF8042"
                  strokeWidth={1} dot={false} name="Upper Band" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="lowerBand" stroke="#FF8042"
                  strokeWidth={1} dot={false} name="Lower Band" strokeDasharray="3 3" />
              </>}
              {showRSI && data.filter(d => d.signal === "BUY").map((d, i) => (
                <ReferenceLine key={`buy-${i}`} x={d.day}
                  stroke="#00C49F" strokeDasharray="3 3" />
              ))}
              {showRSI && data.filter(d => d.signal === "SELL").map((d, i) => (
                <ReferenceLine key={`sell-${i}`} x={d.day}
                  stroke="#FF8042" strokeDasharray="3 3" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>📊 RSI Indicator</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0d1b2a" }} />
              <ReferenceLine y={sellThreshold} stroke="#FF8042"
                strokeDasharray="3 3" label={{ value: "Sell", fill: "#FF8042" }} />
              <ReferenceLine y={buyThreshold} stroke="#00C49F"
                strokeDasharray="3 3" label={{ value: "Buy", fill: "#00C49F" }} />
              <Line type="monotone" dataKey="rsi" stroke="#FFBB28"
                strokeWidth={2} dot={false} name="RSI" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trade Signals Table */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>🎯 Trade Signals</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a2a3a" }}>
                {["Day", "Price", "RSI", "Signal", "Action"].map(h => (
                  <th key={h} style={{
                    padding: "10px", textAlign: "left", color: "#00d4ff"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.filter(d => d.signal === "BUY" || d.signal === "SELL").map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a2a3a" }}>
                  <td style={{ padding: "10px" }}>{d.day}</td>
                  <td style={{ padding: "10px" }}>${d.price}</td>
                  <td style={{ padding: "10px" }}>{d.rsi}</td>
                  <td style={{
                    padding: "10px",
                    color: d.signal === "BUY" ? "#00C49F" : "#FF8042",
                    fontWeight: "bold"
                  }}>{d.signal}</td>
                  <td style={{ padding: "10px", color: "#888" }}>
                    {d.signal === "BUY" ? "RSI oversold — consider buying" : "RSI overbought — consider selling"}
                  </td>
                </tr>
              ))}
              {data.filter(d => d.signal === "BUY" || d.signal === "SELL").length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "16px", color: "#888", textAlign: "center" }}>
                    No strong signals in current data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}