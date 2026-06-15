import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/bloom-logo.png";
import { useShop } from "../context/ShopContext";
import "./Navbar.css";

//this is the navbar component
const Navbar = () => {
  const { cartCount, isLoggedIn, logout } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  //this is the function that closes the menu
  const closeMenu = () => setIsMenuOpen(false);

  //this is the function that handles the logout
  const handleLogout = () => {
    logout();
    closeMenu();
    //this is the function that redirects the user to the login page
    navigate("/login");
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-container">
        <div className="navbar-logo">
          <NavLink className="navbar-brand-link" to="/" onClick={closeMenu}>
            <img src={Logo} alt="Bloom Body Logo" />
            <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "20px", color: "#b85c6b" }}>The Bloom Body</h1>
          </NavLink>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`navbar-links ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
          <NavLink to="/product" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
        </div>
        <div className={`navbar-actions ${isMenuOpen ? "is-open" : ""}`}>
          <NavLink className="cart-link" to="/cart" aria-label="Cart" onClick={closeMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>
          {isLoggedIn ? (
            <button className="login-link" type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <NavLink className="login-link" to="/login" onClick={closeMenu} >Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
