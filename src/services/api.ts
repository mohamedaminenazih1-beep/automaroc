const API_BASE = "/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    let errorMsg = "API Error";
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }
  
  return response.json();
}

export const api = {
  cars: {
    getAll: () => fetchAPI("/cars"),
    create: (data: any) => fetchAPI("/cars", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(\`/cars/\${id}\`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(\`/cars/\${id}\`, { method: "DELETE" }),
  },
  auth: {
    login: (data: any) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: any) => fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    google: (data: any) => fetchAPI("/auth/google", { method: "POST", body: JSON.stringify(data) }),
  },
  bookings: {
    getAll: () => fetchAPI("/bookings"),
    create: (data: any) => fetchAPI("/bookings", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/bookings/${id}`, { method: "DELETE" }),
  },
  categories: {
    getAll: () => fetchAPI("/categories"),
  },
  users: {
    getAll: () => fetchAPI("/users"),
  }
};
