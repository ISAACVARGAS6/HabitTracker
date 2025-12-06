
const API_URL = "http://127.0.0.1:8000/auth";

export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
}

export async function registerUser(email, password) {
  console.log("🔵 [API] Enviando registro a:", `${API_URL}/auth/register`);

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      username: email.split("@")[0] // ✅ genera username simple
    })
  });

  console.log("🔵 [API] Respuesta del registro:", res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ [API] Error en registro:", errorText);
    throw new Error(errorText || "Error al registrarse");
  }

  const data = await res.json();
  console.log("✅ [API] Registro exitoso:", data);
  return data;
}

// ✅ Login (OAuth2)
export async function loginUser(email, password) {
  console.log("🔵 [API] Enviando login a:", `${API_URL}/auth/login`);

  const bodyForm = new URLSearchParams();
  bodyForm.append("username", email);
  bodyForm.append("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: bodyForm
  });

  console.log("🔵 [API] Respuesta del login:", res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ [API] Error en login:", errorText);
    throw new Error(errorText || "Credenciales incorrectas");
  }

  const data = await res.json();
  console.log("✅ [API] Login exitoso:", data);
  return data;
}
