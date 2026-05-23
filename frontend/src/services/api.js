const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      // Handle unauthorized if necessary (e.g. redirect to login)
    }
    const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
    throw new Error(firstError || data.message || "Something went wrong.");
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request("/logout", {
      method: "POST",
    }),
  me: () => request("/user"),
};

export const productsApi = {
  getAll: () => request("/products"),
  getFeatured: () => request("/products/featured"),
  getById: (id) => request(`/products/${id}`),
};

export const cartApi = {
  getCart: () => request("/cart"),
  addToCart: (payload) => request("/cart", { method: "POST", body: JSON.stringify(payload) }),
  removeFromCart: (id) => request(`/cart/${id}`, { method: "DELETE" }),
};

export const ordersApi = {
  getOrders: () => request("/orders"),
  createOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  trackOrder: (orderNumber) => request(`/orders/${orderNumber}`),
  getDeliveryNotifications: () => request("/delivery-notifications"),
};

export const testimonialsApi = {
  getAll: () => request("/testimonials"),
  submit: (payload) => request("/testimonials", { method: "POST", body: JSON.stringify(payload) }),
  like: (id) => request(`/testimonials/${id}/like`, { method: "POST" }),
};

export const notificationsApi = {
  getAll: () => request("/notifications"),
};
