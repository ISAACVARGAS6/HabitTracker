import { useState } from "react";
import { registerUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log("🔵 [FRONTEND] Iniciando registro...", { email, password });
    
    try {
      const result = await registerUser(email, password);
      console.log("✅ [FRONTEND] Registro exitoso:", result);
      navigate("/login");
    } catch (err) {
      console.error("❌ [FRONTEND] Error en registro:", err);
      setError("Error registrando usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Registro</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>

      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}
