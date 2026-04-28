"use client";
import { useState } from "react";
import { auth } from "../../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch  {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0a0a1a, #0d1b2a)"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        padding: "40px", borderRadius: "16px",
        width: "100%", maxWidth: "400px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{ color: "#00d4ff", textAlign: "center",
          marginBottom: "24px", fontSize: "28px" }}>
          📈 TradePro Login
        </h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}
            required style={{
              display: "block", width: "100%", padding: "12px",
              marginBottom: "16px", borderRadius: "8px",
              border: "1px solid #333", background: "#1a1a2e",
              color: "white", fontSize: "15px"
            }} />
          <input type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            required style={{
              display: "block", width: "100%", padding: "12px",
              marginBottom: "16px", borderRadius: "8px",
              border: "1px solid #333", background: "#1a1a2e",
              color: "white", fontSize: "15px"
            }} />
          <button type="submit" style={{
            width: "100%", padding: "12px",
            background: "#00d4ff", color: "#000",
            border: "none", borderRadius: "8px",
            fontSize: "16px", fontWeight: "bold", cursor: "pointer"
          }}>
            Login
          </button>
        </form>
        <p style={{ color: "#888", textAlign: "center", marginTop: "16px" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "#00d4ff" }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}