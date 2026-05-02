"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const generateMarketData = () => {
  let price = 150;
  return Array.from({ length: 30 }, (_, i) => {
    const change = (Math.random() - 0.5) * 15;
    price += change;
    const volume = Math.floor(Math.random() * 1000000 + 500000);
    const volatility = Math.abs(change / price * 100);
    const rsi = Math.floor(Math.random() * 100);
    const macd = parseFloat(((Math.random() - 0.5) * 5).toFixed(2));
    return {
      day: `D${i + 1}`,
      price: parseFloat(price.toFixed(2)),
      volume,
      volatility: parseFloat(volatility.toFixed(2)),
      rsi,
      macd,
      ma20: parseFloat((price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
    };
  });
};

const generateSectorData = () => [
  { name: "Technology", value: Math.floor(Math.random() * 30 + 20) },
  { name: "Finance", value: Math.floor(Math.random() * 20 + 15) },
  { name: "Healthcare", value: Math.floor(Math.random() * 15 + 10) },
  { name: "Energy", value: Math.floor(Math.random() * 15 + 10) },
  { name: "Consumer", value: Math.floor(Math.random() * 10 + 5) },
];

export default function Analytics() {
  const router = useRouter();
  const [data, setData] = useState(generateMarketData());
  const [sectorData, setSectorData] = useState(generateSectorData());
  const [timeRange, setTimeRange] = useState(30);
  const [activeMetric, setActiveMetric] = useState("price");

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMarketData());
      setSectorData(generateSectorData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const displayData = data.slice(-timeRange);
  const latest = displayData[displayData.length - 1];
  const first = displayData[0];
  const priceChange = latest && first
    ? parseFloat((latest.price - first.price).toFixed(2))
    : 0;
  const priceChangePct = first
    ? parseFloat(((priceChange / first.price) * 100).toFixed(2))
    : 0;
  const avgVolatility = parseFloat(
    (displayData.reduce((a, b) => a + b.volatility, 0) / displayData.length).toFixed(2)
  );
  const avgRSI = parseFloat(
    (displayData.reduce((a, b) => a + b.rsi, 0) / displayData.length).toFixed(2)
  );
  const avgVolume = Math.floor(
    displayData.reduce((a, b) => a + b.volume, 0) / displayData.length
  );

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

      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>
          📈 Advanced Analytics Dashboard
        </h2>
        <p style={{ color: "#888", marginBottom: "24px" }}>
          🔄 Auto-updating every 5 seconds
        </p>

        {/* Time Range */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[7, 14, 30].map(r => (
            <button key={r} onClick={() => setTimeRange(r)} style={{
              padding: "8px 20px",
              background: timeRange === r ? "#00d4ff" : "#1a2a3a",
              color: timeRange === r ? "#000" : "#fff",
              border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>{r}D</button>
          ))}
        </div>

        {/* KPI Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px", marginBottom: "24px"
        }}>
          {[
            { label: "💰 Current Price", value: `$${latest?.price}`, color: "#00d4ff" },
            { label: "📈 Price Change", value: `${priceChange >= 0 ? "+" : ""}$${priceChange} (${priceChangePct}%)`, color: priceChange >= 0 ? "#00C49F" : "#FF8042" },
            { label: "⚡ Avg Volatility", value: `${avgVolatility}%`, color: "#FFBB28" },
            { label: "📊 Avg RSI", value: avgRSI, color: avgRSI > 70 ? "#FF8042" : avgRSI < 30 ? "#00C49F" : "#888" },
            { label: "📦 Avg Volume", value: `${(avgVolume / 1000).toFixed(0)}K`, color: "#8884d8" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#0d1b2a", padding: "16px",
              borderRadius: "12px", textAlign: "center",
              border: "1px solid #1a2a3a"
            }}>
              <p style={{ color: "#888", marginBottom: "8px", fontSize: "12px" }}>{s.label}</p>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: s.color as string }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Metric Selector */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { key: "price", label: "💰 Price" },
            { key: "volume", label: "📦 Volume" },
            { key: "volatility", label: "⚡ Volatility" },
            { key: "rsi", label: "📊 RSI" },
            { key: "macd", label: "📉 MACD" },
          ].map(m => (
            <button key={m.key} onClick={() => setActiveMetric(m.key)} style={{
              padding: "8px 16px",
              background: activeMetric === m.key ? "#00d4ff" : "#1a2a3a",
              color: activeMetric === m.key ? "#000" : "#fff",
              border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>{m.label}</button>
          ))}
        </div>

        {/* Main Area Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>
            {activeMetric.toUpperCase()} Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1a2a3a" }} />
              <Area type="monotone" dataKey={activeMetric}
                stroke="#00d4ff" fill="url(#colorMetric)"
                strokeWidth={2} name={activeMetric} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Price + MA Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>📈 Price vs Moving Average</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#0d1b2a" }} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#00d4ff"
                strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="ma20" stroke="#FFBB28"
                strokeWidth={1.5} dot={false} name="MA20" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Volume Chart */}
          <div style={{
            background: "#0d1b2a", padding: "24px",
            borderRadius: "16px", border: "1px solid #1a2a3a"
          }}>
            <h3 style={{ marginBottom: "16px" }}>📦 Volume Analysis</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 9 }} />
                <YAxis stroke="#888" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#0d1b2a" }}
                  formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, "Volume"]} />
                <Bar dataKey="volume" fill="#8884d8" name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Pie */}
          <div style={{
            background: "#0d1b2a", padding: "24px",
            borderRadius: "16px", border: "1px solid #1a2a3a"
          }}>
            <h3 style={{ marginBottom: "16px" }}>🥧 Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1b2a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RSI + MACD */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{
            background: "#0d1b2a", padding: "24px",
            borderRadius: "16px", border: "1px solid #1a2a3a"
          }}>
            <h3 style={{ marginBottom: "16px" }}>📊 RSI</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 9 }} />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0d1b2a" }} />
                <Line type="monotone" dataKey="rsi" stroke="#FFBB28"
                  strokeWidth={2} dot={false} name="RSI" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: "#0d1b2a", padding: "24px",
            borderRadius: "16px", border: "1px solid #1a2a3a"
          }}>
            <h3 style={{ marginBottom: "16px" }}>📉 MACD</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 9 }} />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: "#0d1b2a" }} />
                <Bar dataKey="macd" name="MACD"
                  fill="#8884d8"
                  label={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}