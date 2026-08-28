const BASE_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Autenticazione
export const registerUser = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore registrazione");
  return data;
};

// login
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore login");
  return data;
};

// profile section with crud funcs
export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/profile`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore fetch profilo");
  return data;
};

export const createProfile = async (profileData) => {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore creazione profilo");
  return data;
};

export const updateProfile = async (profileData) => {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore aggiornamento profilo");
  return data;
};

export const getSessioni = async () => {
  const res = await fetch(`${BASE_URL}/sessioni`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore fetch sessioni");
  return data;
};

export const createSessione = async (sessioneData) => {
  const res = await fetch(`${BASE_URL}/sessioni`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(sessioneData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore creazione sessione");
  return data;
};

export const updateSessione = async (id, sessioneData) => {
  const res = await fetch(`${BASE_URL}/sessioni/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(sessioneData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore aggiornamento sessione");
  return data;
};

export const deleteSessione = async (id) => {
  const res = await fetch(`${BASE_URL}/sessioni/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore eliminazione sessione");
  return data;
};
