import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { isProductAvailable } from "../utils/productMapper";
import "./Cart.css";

const Cart = () => {
  const {
    cart,
    cartTotal,
    increaseQuantity,
    reduceQuantity,
    removeFromCart,
    clearCart,
    canCheckout,
    syncCartAvailability,
  } = useShop();
  // This function handles the order now button
  const navigate = useNavigate();
  // This function handles the order placed state
  const [orderPlaced, setOrderPlaced] = React.useState(
    () => localStorage.getItem("bloomOrderPlaced") === "true"
  );

  const [selectedIds, setSelectedIds] = React.useState(() => cart.map(item => item.id));

  // Sync selected IDs when cart updates
  useEffect(() => {
    const cartIds = cart.map(item => item.id);
    setSelectedIds(prev => {
      const existing = prev.filter(id => cartIds.includes(id));
      const added = cartIds.filter(id => !prev.includes(id));
      return [...existing, ...added];
    });
  }, [cart]);

  // Persist selected IDs to local storage
  useEffect(() => {
    localStorage.setItem("bloomSelectedCartItemIds", JSON.stringify(selectedIds));
  }, [selectedIds]);

  const selectedItems = cart.filter((item) => selectedIds.includes(item.id));
  const hasUnavailableSelectedItems = selectedItems.some((item) => !isProductAvailable(item));

  const selectedTotal = React.useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (Number(String(item.price).replace(/[^\d]/g, "")) || 0) * item.quantity,
      0
    );
  }, [selectedItems]);

  useEffect(() => {
    syncCartAvailability();
    const interval = window.setInterval(syncCartAvailability, 15000);
    return () => window.clearInterval(interval);
  }, [syncCartAvailability]);
    // This function handles the order now button
  const handleOrder = () => {
    // If nothing selected, return
    if (selectedItems.length === 0 || hasUnavailableSelectedItems) return;
    // If the cart can be checked out, redirect to the payment page
    if (canCheckout()) {
      // Saves the order placed state to local storage
      localStorage.setItem("bloomOrderPlaced", "true");
      setOrderPlaced(true);
      navigate("/payment");
    }
  };

  return (
    <main className="cart-page">
      <header className="cart-header">
        <h1>Your Cart</h1>
        <hr />
      </header>

      <div className="cart-items">
        {/* If the cart is empty, display an empty cart message */} 
        {cart.length === 0 && <p className="empty-cart-message">Your cart is empty.</p>}
        {/* Renders the cart items */}
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-checkbox-container">
              <input
                type="checkbox"
                className="cart-item-checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds([...selectedIds, item.id]);
                  } else {
                    setSelectedIds(selectedIds.filter(id => id !== item.id));
                  }
                }}
              />
            </div>
            <img className="cart-image" src={item.image} alt={item.title} />
            <div className="cart-item-details">
              <h2>{item.title}</h2>
              <p>NGN {item.price}</p>
              { !isProductAvailable(item) && (
                <p style={{ color: 'var(--deep-pink)' }}>{item.unavailable_message || 'Currently unavailable'}</p>
              )}
              {/* Quantity controls */}
              <div className="cart-quantity-controls" aria-label={`${item.title} quantity`}>
                <button type="button" onClick={() => reduceQuantity(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => increaseQuantity(item.id)} disabled={!isProductAvailable(item)}>+</button>
              </div>
              <button className="delete-btn" type="button" onClick={() => removeFromCart(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Total: NGN {selectedTotal.toLocaleString()}</h2>
        {cart.length > selectedItems.length && (
          <p className="cart-total-all" style={{ fontSize: '0.9rem', color: 'var(--dashboard-muted)', margin: '4px 0 16px' }}>
            Subtotal (all items): NGN {cartTotal.toLocaleString()}
          </p>
        )}
        <div className="cart-summary-actions">
          {/* If the cart is not empty, display a clear cart button */}
          {cart.length > 0 && (
            <button className="clear-cart-btn" type="button" onClick={clearCart}>
              Clear Cart
            </button>
          )}
          <button className="order-btn" type="button" onClick={handleOrder} disabled={selectedItems.length === 0 || hasUnavailableSelectedItems}>
            Order Now
          </button>
        </div>
      </div>
    </main>
  );
};

export default Cart;
