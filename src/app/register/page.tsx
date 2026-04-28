"use client";
import { useState } from "react";
import { auth, db } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        email: res.user.email,
        watchlist: [],
        portfolio: [],
        preferences: {},
        createdAt: new Date()
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
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
          📈 Create Account
        </h2>
        {error && <p style={{ color: "red", textAlign: "center",
          fontSize: "13px" }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <input type="email" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}
            required style={{
              display: "block", width: "100%", padding: "12px",
              marginBottom: "16px", borderRadius: "8px",
              border: "1px solid #333", background: "#1a1a2e",
              color: "white", fontSize: "15px"
            }} />
          <input type="password" placeholder="Password (min 6 chars)"
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
            Create Account
          </button>
        </form>
        <p style={{ color: "#888", textAlign: "center", marginTop: "16px" }}>
          Already have account?{" "}
          <Link href="/login" style={{ color: "#00d4ff" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}