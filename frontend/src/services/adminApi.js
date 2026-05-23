const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("adminToken");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/admin${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
    throw new Error(firstError || data.message || "Something went wrong.");
  }

  return data;
};

export const adminAuthApi = {
  login: (payload) => request("/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/logout", { method: "POST" }),
  me: () => request("/me"),
};

export const adminDashboardApi = {
  getAnalytics: () => request("/dashboard/analytics"),
};

export const adminProductsApi = {
  getAll: () => request("/products"),
  getCategories: () => request("/categories"),
  create: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export const adminOrdersApi = {
  getAll: (deliveryDate = "") => request(`/orders${deliveryDate ? `?delivery_date=${encodeURIComponent(deliveryDate)}` : ""}`),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  scheduleDelivery: (scheduleGroup) => request("/orders/delivery-schedule", { method: "POST", body: JSON.stringify({ schedule_group: scheduleGroup }) }),
};

export const adminNotificationsApi = {
  getAll: () => request("/notifications"),
  create: (payload) => request("/notifications", { method: "POST", body: JSON.stringify(payload) }),
  delete: (id) => request(`/notifications/${id}`, { method: "DELETE" }),
};
