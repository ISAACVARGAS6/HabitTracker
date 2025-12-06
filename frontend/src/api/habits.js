const API_URL = "http://127.0.0.1:8000";

export async function fetchHabitsDashboard() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/habits`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Error cargando dashboard");
  return res.json();
}

export async function createHabit(habitData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/habits`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(habitData)
  });

  if (!res.ok) throw new Error("Error al crear hábito");
  return res.json();
}

export async function completeHabit(habitId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/habits/${habitId}/complete`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Error completando hábito");
  return res.json();
}

export async function deleteHabit(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/habits/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Error eliminando hábito");
  return res.json();
}