import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
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
  } = useShop();
  // This function handles the order now button
  const navigate = useNavigate();
  // This function handles the order placed state
  const [orderPlaced, setOrderPlaced] = React.useState(
    () => localStorage.getItem("bloomOrderPlaced") === "true"
  );
  const hasUnavailableItems = cart.some((item) => item.is_available === false);
    // This function handles the order now button
  const handleOrder = () => {
    // If the cart is empty, return
    if (cart.length === 0 || hasUnavailableItems) return;
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
            <img className="cart-image" src={item.image} alt={item.title} />
            <div className="cart-item-details">
              
              <h2>{item.title}</h2>
              <p>NGN {item.price}</p>
              {item.is_available === false && (
                <p style={{ color: 'var(--deep-pink)' }}>Unavailable</p>
              )}
              {/* Quantity controls */}
              <div className="cart-quantity-controls" aria-label={`${item.title} quantity`}>
                <button type="button" onClick={() => reduceQuantity(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => increaseQuantity(item.id)}>+</button>
              </div>
              <button className="delete-btn" type="button" onClick={() => removeFromCart(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Total: NGN {cartTotal.toLocaleString()}</h2>
        <div className="cart-summary-actions">
          {/* If the cart is not empty, display a clear cart button */}
          {cart.length > 0 && (
            <button className="clear-cart-btn" type="button" onClick={clearCart}>
              Clear Cart
            </button>
          )}
          <button className="order-btn" type="button" onClick={handleOrder} disabled={cart.length === 0 || hasUnavailableItems}>
            Order Now
          </button>
        </div>
        {/* If an order has been placed, display a track order link */}
        {/* {orderPlaced && (
          <Link className="track-order-link" to="/track-order">
            Track Order
          </Link>
        )} */}
      </div>
    </main>
  );
};

export default Cart;
