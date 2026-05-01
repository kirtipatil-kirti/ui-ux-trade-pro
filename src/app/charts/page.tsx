"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const ASSETS = [
  { key: "AAPL", name: "Apple", color: "#0088FE" },
  { key: "GOOGL", name: "Google", color: "#00C49F" },
  { key: "BTC", name: "Bitcoin", color: "#FFBB28" },
  { key: "BONDS", name: "Bonds", color: "#FF8042" },
];

const generateData = () =>
  Array.from({ length: 20 }, (_, i) => ({
    day: `Day ${i + 1}`,
    AAPL: Math.floor(150 + Math.random() * 50),
    GOOGL: Math.floor(120 + Math.random() * 60),
    BTC: Math.floor(200 + Math.random() * 100),
    BONDS: Math.floor(80 + Math.random() * 20),
  }));

export default function Charts() {
  const [data, setData] = useState(generateData());
  const [visible, setVisible] = useState({
    AAPL: true, GOOGL: true, BTC: true, BONDS: true
  });
  const [chartType, setChartType] = useState("line");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateData());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleAsset = (key: string) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "white" }}>
      {/* Navbar */}
      <div style={{
        background: "#0d1b2a", padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #1a2a3a"
      }}>
        <h1 style={{ color: "#00d4ff", fontSize: "22px" }}>📈 TradePro</h1>
        <button onClick={() => router.push("/dashboard")}
          style={{
            background: "#1a2a3a", color: "#00d4ff",
            border: "1px solid #00d4ff", padding: "8px 20px",
            borderRadius: "8px", cursor: "pointer"
          }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "24px" }}>
          📊 Multi-Asset Chart
        </h2>

        {/* Chart Type */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
          <button onClick={() => setChartType("line")}
            style={{
              padding: "8px 24px",
              background: chartType === "line" ? "#00d4ff" : "#1a2a3a",
              color: chartType === "line" ? "#000" : "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold"
            }}>
            📈 Line
          </button>
          <button onClick={() => setChartType("bar")}
            style={{
              padding: "8px 24px",
              background: chartType === "bar" ? "#00d4ff" : "#1a2a3a",
              color: chartType === "bar" ? "#000" : "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold"
            }}>
            📊 Bar
          </button>
        </div>

        {/* Asset Toggles */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {ASSETS.map(asset => (
            <button key={asset.key}
              onClick={() => toggleAsset(asset.key)}
              style={{
                padding: "8px 20px",
                background: visible[asset.key as keyof typeof visible] ? asset.color : "#333",
                color: "white", border: "none",
                borderRadius: "8px", cursor: "pointer",
                fontWeight: "bold", opacity: visible[asset.key as keyof typeof visible] ? 1 : 0.5
              }}>
              {visible[asset.key as keyof typeof visible] ? "✅" : "❌"} {asset.name}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <p style={{ color: "#888", marginBottom: "16px" }}>
            🔄 Auto-updating every 3 seconds
          </p>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1a2a3a" }} />
                <Legend />
                {ASSETS.map(asset =>
                  visible[asset.key as keyof typeof visible] && (
                    <Line key={asset.key} type="monotone"
                      dataKey={asset.key} stroke={asset.color}
                      strokeWidth={2} dot={false} name={asset.name} />
                  )
                )}
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #1a2a3a" }} />
                <Legend />
                {ASSETS.map(asset =>
                  visible[asset.key as keyof typeof visible] && (
                    <Bar key={asset.key}
                      dataKey={asset.key} fill={asset.color}
                      name={asset.name} />
                  )
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {ASSETS.map(asset => (
            <div key={asset.key} style={{
              background: "#0d1b2a", padding: "20px",
              borderRadius: "12px", textAlign: "center",
              borderTop: `4px solid ${asset.color}`,
              border: `1px solid #1a2a3a`,
              borderTopColor: asset.color
            }}>
              <h3 style={{ color: asset.color, marginBottom: "8px" }}>{asset.key}</h3>
              <p style={{ color: "#888", fontSize: "13px" }}>{asset.name}</p>
              <p style={{ fontSize: "22px", fontWeight: "bold", marginTop: "8px" }}>
                ${data[data.length - 1]?.[asset.key as keyof typeof data[0]]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}