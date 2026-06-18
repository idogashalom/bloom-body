import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, productsApi } from "../services/api";
import { isProductAvailable, normalizeProduct } from "../utils/productMapper";

const ShopContext = createContext(null);
//this is the function that reads from the local storage  

const readStorage = (key, fallback) => {
  //this is the try catch block that handles the local storage
  try {
    //this is the function that gets the items from the local storage in json format
    const stored = localStorage.getItem(key);
    //this is the function that parses the local storage
    return stored ? JSON.parse(stored) : fallback;
    //this is the function that handles the errors
  } catch {
    return fallback;
  }
};

const priceToNumber = (price) => Number(String(price).replace(/[^\d]/g, "")) || 0;
//this is the function that sets the users state in the local storage
//this is the function that sets the current user state in the local storage
//this is the function that sets the cart state in the local storage
//this is the function that sets the policy agreed state in the local storage
//this is the function that sets the auth prompt open state in the local storage
//this is the function that sets the policy prompt open state in the local storage
//this is the function that sets the reviews state in the local storage


export const ShopProvider = ({ children }) => {
  const [users, setUsers] = useState(() => readStorage("bloomUsers", []));
  const [currentUser, setCurrentUser] = useState(() => readStorage("bloomCurrentUser", null));
  const [cart, setCart] = useState(() => readStorage("bloomCart", []));
  const [policyAgreed, setPolicyAgreed] = useState(() => readStorage("bloomPolicyAgreed", false));
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [policyPromptOpen, setPolicyPromptOpen] = useState(false);
  const [reviews, setReviews] = useState(() =>
    readStorage("bloomReviews", [
      {
        id: 1,
        name: "Jenifer",
        message: "I love the products! They have transformed my skin!",
        likes: 0,
        lovedBy: [],
      },
      {
        id: 2,
        name: "Sandra",
        message: "The customer service is amazing. Highly recommend!",
        likes: 0,
        lovedBy: [],
      },
      {
        id: 3,
        name: "Emily",
        message: "Bloom Body has become a staple in my skincare routine.",
        likes: 0,
        lovedBy: [],
      },
    ])
  );
  //this is the function that saves the users to the local storage
  useEffect(() => localStorage.setItem("bloomUsers", JSON.stringify(users)), [users]);
  //this is the function that saves the current user to the local storage 
  useEffect(() => localStorage.setItem("bloomCurrentUser", JSON.stringify(currentUser)), [currentUser]);
  //this is the function that saves the cart to the local storage 
  useEffect(() => localStorage.setItem("bloomCart", JSON.stringify(cart)), [cart]);
  //this is the function that saves the policy agreed to the local storage 
  useEffect(() => localStorage.setItem("bloomPolicyAgreed", JSON.stringify(policyAgreed)), [policyAgreed]);
  //this is the function that saves the reviews to the local storage 
  useEffect(() => localStorage.setItem("bloomReviews", JSON.stringify(reviews)), [reviews]);

  const syncCartAvailability = useCallback(async () => {
    try {
      const data = await productsApi.getAll();
      const productMap = new Map(
        data.map((product) => [Number(product.id), normalizeProduct(product)])
      );

      setCart((items) => {
        if (items.length === 0) return items;

        return items.map((item) => {
          const latest = productMap.get(Number(item.id));
          if (!latest) return item;

          return {
            ...item,
            is_available: latest.is_available,
            unavailable_message: latest.unavailable_message,
            price: latest.price,
            title: latest.title || item.title,
            name: latest.name || item.name,
          };
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    syncCartAvailability();
  }, [syncCartAvailability]);

  //this is the function that registers a new user
  const register = async ({ name, email, password }) => {
    //this is the function that cleans the email 
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await authApi.register({
        name: name.trim(),
        email: cleanEmail,
        password,
      });
      if (data.token) localStorage.setItem("token", data.token);
      const user = data.user;
      //this is the function that adds the new user to the existing users
      setUsers((existingUsers) => [...existingUsers.filter((item) => item.email !== user.email), user]);
      //this is the function that sets the current user
      setCurrentUser(user);
      //this is the function that returns true if the registration is successful
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  //this is the function that logs in a user
  const login = async ({ email, password }) => {
    //this is the function that cleans the email 
    const cleanEmail = email.trim().toLowerCase();
    try {
      const data = await authApi.login({
        email: cleanEmail,
        password,
      });
      if (data.token) localStorage.setItem("token", data.token);
      const user = data.user;
      //this is the function that saves the backend user locally
      setUsers((existingUsers) => [...existingUsers.filter((item) => item.email !== user.email), user]);
      //this is the function that sets the current user
      setCurrentUser(user);
      //this is the function that returns true if the login is successful
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  //this is the function that logs out a user
  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const updateProfile = async ({ name, email, currentPassword, newPassword, confirmPassword }) => {
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      if (currentPassword || newPassword || confirmPassword) {
        payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.password_confirmation = confirmPassword;
      }

      const data = await authApi.updateProfile(payload);
      const user = data.user;
      setUsers((existingUsers) => [...existingUsers.filter((item) => item.id !== user.id), user]);
      setCurrentUser(user);
      return { ok: true, message: data.message || "Profile updated successfully." };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  //this is the function that requests the user to log in or register
  const requestAuth = () => {
    setAuthPromptOpen(true);
    return false;
  };

  //this is the function that requests the user to agree to the policy
  const requestPolicyAgreement = () => {
    //this is the function that sets the policy prompt to open
    setPolicyPromptOpen(true);
    return false;
  };

  const addToCart = (product, quantity = 1) => {
    //this is the function that checks if the user is logged in
    if (!currentUser) {
      return requestAuth();
    }

    if (!isProductAvailable(product)) {
      const message = product.unavailable_message || "This product is currently unavailable at the moment, bestie 💕";
      // notify user via toast event
      try {
        window.dispatchEvent(new CustomEvent("bloom-toast", { detail: { message: message, duration: 3000 } }));
      } catch (e) {
        // ignore if window not available
      }
      return false;
    }

    setCart((items) => {
      //this is the function that checks if the product is already in the cart
      const existingItem = items.find((item) => item.id === product.id);
      //this is the function that updates the quantity if the product is already in the cart
      if (existingItem) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      //this is the function that adds the product to the cart
      return [...items, { ...product, quantity }];
    });
    // Dispatch toast event
    try {
      window.dispatchEvent(
        new CustomEvent("bloom-toast", {
          detail: { message: "Product has been added to cart", duration: 3000 },
        })
      );
    } catch (e) {
      // ignore
    }
    //this is the function that returns true if the product is added to the cart
    return true;
  };

  //this is the function that increases the quantity of the product in the cart
  const increaseQuantity = (id) => {
    setCart((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        if (!isProductAvailable(item)) return item;
        return { ...item, quantity: item.quantity + 1 };
      })
    );
  };

  //this is the function that reduces the quantity of the product in the cart
  const reduceQuantity = (id) => {
    setCart((items) =>
      items
        //this is the function that updates the quantity of the product in the cart
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        //this is the function that removes the product from the cart if the quantity is 0
        .filter((item) => item.quantity > 0)
    );
  };

  //this is the function that removes the product from the cart
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item.id !== id));
  //this is the function that clears the cart
  const clearCart = () => setCart([]);

  //this is the function that calculates the total price of the products in the cart
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + priceToNumber(item.price) * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    //this is the function that counts the number of products in the cart
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const canCheckout = () => {
    //this is the function that checks if the user is logged in
    if (!currentUser) {
      return requestAuth();
    }

    if (!policyAgreed) {
      //this is the function that requests the user to agree to the policy
      return requestPolicyAgreement();
    }

    return true;
  };

  const agreeToPolicy = () => {
    //this is the function that sets the policy agreed to true
    setPolicyAgreed(true);
    //this is the function that sets the policy prompt to close
    setPolicyPromptOpen(false);
  };

  //this is the function that adds a review to the existing reviews
  const addReview = ({ name, message }) => {
    //this is the function that updates the reviews with the new review
    setReviews((existingReviews) => [
      {
        id: Date.now(),
        name: name.trim(),
        message: message.trim(),
        likes: 0,
        lovedBy: [],
      },
      ...existingReviews,
    ]);
  };

  //this is the function that toggles the love of a review
  const toggleReviewLove = (id) => {
    const loverId = currentUser?.email || "guest";

    //this is the function that updates the reviews with the new review
    setReviews((existingReviews) =>
      existingReviews.map((review) => {
        if (review.id !== id) return review;

        //this is the function that checks if the review is already loved
        const alreadyLoved = review.lovedBy.includes(loverId);
        //this is the function that updates the review
        return {
          ...review,
          lovedBy: alreadyLoved
            ? review.lovedBy.filter((item) => item !== loverId)
            : [...review.lovedBy, loverId],
          likes: alreadyLoved ? Math.max(0, review.likes - 1) : review.likes + 1,
        };
      })
    );
  };

  //this is the function that updates the value
  const value = {
    users,
    currentUser,
    isLoggedIn: Boolean(currentUser),
    login,
    register,
    logout,
    updateProfile,
    cart,
    cartCount,
    cartTotal,
    addToCart,
    increaseQuantity,
    reduceQuantity,
    removeFromCart,
    clearCart,
    syncCartAvailability,
    canCheckout,
    policyAgreed,
    agreeToPolicy,
    policyPromptOpen,
    setPolicyPromptOpen,
    authPromptOpen,
    setAuthPromptOpen,
    requestAuth,
    reviews,
    addReview,
    toggleReviewLove,
  };

  //this is the function that returns the value and the provider
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
};
