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

export const getLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/logs${query ? `?${query}` : ""}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore fetch logs");
  return data;
};

export const getLogsByEsercizio = async (nome_esercizio) => {
  const res = await fetch(
    `${BASE_URL}/logs/esercizio/${encodeURIComponent(nome_esercizio)}`,
    {
      headers: getHeaders(),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore fetch logs esercizio");
  return data;
};

export const getSuggerimentoCarichi = async (sessione_id) => {
  const res = await fetch(`${BASE_URL}/logs/suggerimento/${sessione_id}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore fetch suggerimento");
  return data;
};

export const createLog = async (logData) => {
  const res = await fetch(`${BASE_URL}/logs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(logData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore creazione log");
  return data;
};

export const updateLog = async (id, logData) => {
  const res = await fetch(`${BASE_URL}/logs/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(logData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore aggiornamento log");
  return data;
};

export const deleteLog = async (id) => {
  const res = await fetch(`${BASE_URL}/logs/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore eliminazione log");
  return data;
};
