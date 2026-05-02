"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ComposedChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

interface Candle {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pattern?: string;
  patternColor?: string;
}

const detectPattern = (candle: Candle): { name: string; color: string; description: string } | null => {
  const { open, high, low, close } = candle;
  const body = Math.abs(close - open);
  const range = high - low;
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;

  if (body <= range * 0.1) {
    return {
      name: "Doji",
      color: "#FFBB28",
      description: "Market indecision — possible trend reversal"
    };
  }
  if (lowerWick >= body * 2 && upperWick <= body * 0.3 && close > open) {
    return {
      name: "Hammer",
      color: "#00C49F",
      description: "Bullish reversal signal at bottom of downtrend"
    };
  }
  if (upperWick >= body * 2 && lowerWick <= body * 0.3 && close < open) {
    return {
      name: "Shooting Star",
      color: "#FF8042",
      description: "Bearish reversal signal at top of uptrend"
    };
  }
  if (body >= range * 0.7 && close > open) {
    return {
      name: "Bullish Engulfing",
      color: "#0088FE",
      description: "Strong bullish momentum — buyers in control"
    };
  }
  if (body >= range * 0.7 && close < open) {
    return {
      name: "Bearish Engulfing",
      color: "#FF0000",
      description: "Strong bearish momentum — sellers in control"
    };
  }
  return null;
};

const generateCandles = (): Candle[] => {
  let price = 150;
  return Array.from({ length: 20 }, (_, i) => {
    const change = (Math.random() - 0.5) * 20;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    price = close;
    const candle: Candle = {
      day: `Day ${i + 1}`,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    };
    const detected = detectPattern(candle);
    if (detected) {
      candle.pattern = detected.name;
      candle.patternColor = detected.color;
    }
    return candle;
  });
};

const PATTERN_INFO: Record<string, { color: string; description: string }> = {
  "Doji": { color: "#FFBB28", description: "Market indecision — possible trend reversal" },
  "Hammer": { color: "#00C49F", description: "Bullish reversal signal at bottom of downtrend" },
  "Shooting Star": { color: "#FF8042", description: "Bearish reversal signal at top of uptrend" },
  "Bullish Engulfing": { color: "#0088FE", description: "Strong bullish momentum — buyers in control" },
  "Bearish Engulfing": { color: "#FF0000", description: "Strong bearish momentum — sellers in control" },
};

const CandleBar = (props: any) => {
  const { x, y, width, height } = props;
  const isGreen = props.close >= props.open;
  const color = isGreen ? "#00C49F" : "#FF8042";
  const barY = Math.min(y, y + height);
  const barHeight = Math.abs(height);

  return (
    <g>
      <rect x={x} y={barY} width={width}
        height={Math.max(barHeight, 2)}
        fill={color} stroke={color} />
    </g>
  );
};


export default function Patterns() {
  const router = useRouter();
  const [candles, setCandles] = useState<Candle[]>(generateCandles());
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Candle | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(generateCandles());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const patterns = ["All", "Doji", "Hammer", "Shooting Star", "Bullish Engulfing", "Bearish Engulfing"];

  

  const detectedPatterns = candles.filter(c => c.pattern);

  return (
    <div style={{ background: "#0a0a1a", minHeight: "100vh", color: "white" }}>
      {/* Navbar */}
      <div style={{
        background: "#0d1b2a", padding: "16px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "const filteredCcenter", borderBottom: "1px solid #1a2a3a"
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
          🕯️ Candlestick Pattern Recognition
        </h2>
        <p style={{ color: "#888", marginBottom: "24px" }}>
          🔄 Auto-updating every 5 seconds
        </p>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
          {patterns.map(p => (
            <button key={p} onClick={() => setFilter(p)} style={{
              padding: "8px 16px",
              background: filter === p ? (PATTERN_INFO[p]?.color || "#00d4ff") : "#1a2a3a",
              color: filter === p ? "#000" : "#fff",
              border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: "bold"
            }}>{p}</button>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", marginBottom: "24px",
          border: "1px solid #1a2a3a"
        }}>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={candles}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
              <XAxis dataKey="day" stroke="#888" tick={{ fontSize: 11 }} />
              <YAxis stroke="#888" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: "#0d1b2a", border: "1px solid #1a2a3a" }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const d = payload[0].payload as Candle;
                    return (
                      <div style={{
                        background: "#0d1b2a", padding: "12px",
                        borderRadius: "8px", border: "1px solid #1a2a3a"
                      }}>
                        <p style={{ color: "#00d4ff" }}>{d.day}</p>
                        <p>Open: ${d.open}</p>
                        <p>High: ${d.high}</p>
                        <p>Low: ${d.low}</p>
                        <p>Close: ${d.close}</p>
                        {d.pattern && (
                          <p style={{ color: d.patternColor, fontWeight: "bold", marginTop: "8px" }}>
                            Pattern: {d.pattern}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="close" fill="#00C49F" opacity={0.8} />
              {candles.filter(c => c.pattern).map((c, i) => (
                <ReferenceLine key={i} x={c.day}
                  stroke={c.patternColor} strokeDasharray="3 3"
                  label={{ value: c.pattern, fill: c.patternColor, fontSize: 10 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Detected Patterns */}
        <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>
          🔍 Detected Patterns ({detectedPatterns.length})
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px", marginBottom: "24px"
        }}>
          {detectedPatterns.length === 0 ? (
            <p style={{ color: "#888" }}>No patterns detected in current data</p>
          ) : (
            detectedPatterns.map((c, i) => (
              <div key={i} onClick={() => setSelected(c)} style={{
                background: "#0d1b2a", padding: "16px",
                borderRadius: "12px", cursor: "pointer",
                border: `2px solid ${selected?.day === c.day ? c.patternColor : "#1a2a3a"}`,
                borderLeft: `4px solid ${c.patternColor}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: c.patternColor, fontWeight: "bold" }}>
                    {c.pattern}
                  </span>
                  <span style={{ color: "#888", fontSize: "13px" }}>{c.day}</span>
                </div>
                <p style={{ color: "#aaa", fontSize: "13px", marginTop: "8px" }}>
                  {PATTERN_INFO[c.pattern!]?.description}
                </p>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                  O:{c.open} H:{c.high} L:{c.low} C:{c.close}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pattern Legend */}
        <div style={{
          background: "#0d1b2a", padding: "24px",
          borderRadius: "16px", border: "1px solid #1a2a3a"
        }}>
          <h3 style={{ marginBottom: "16px" }}>📚 Pattern Guide</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px"
          }}>
            {Object.entries(PATTERN_INFO).map(([name, info]) => (
              <div key={name} style={{
                padding: "12px", borderRadius: "8px",
                borderLeft: `4px solid ${info.color}`,
                background: "#1a2a3a"
              }}>
                <p style={{ color: info.color, fontWeight: "bold" }}>{name}</p>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}