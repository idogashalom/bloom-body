import { NavLink } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <section className="footer-brand" aria-label="Brand">
          <div className="footer-logo">
            <img src={Logo} alt="Bloom Body Logo" />
            <h2>The Bloom Body</h2>
          </div>
          <p>Soft body care for confidence, glow, and healthy transformation.</p>
        </section>

        <nav className="footer-links" aria-label="Footer navigation">
          <h3>Navigation</h3>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/product">Shop</NavLink>
        </nav>

        <section className="footer-contact" aria-label="Contact links">
          <h3>Contact</h3>
          <a href="mailto:stephanieabang260@gmail.com" aria-label="Email Bloom Body">
            <i className="fas fa-envelope"></i>
            <span>Email</span>
          </a>
          <a href="tel:+2348122112738" aria-label="Call Bloom Body">
            <i className="fas fa-phone"></i>
            <span>Phone</span>
          </a>
          <a href="https://www.google.com/maps/place/Apo+Urban+Market,+Abuja,+Nigeria/" aria-label="bloom-address">
          <i className="fas fa-map-marker-alt"></i> <span>Address</span>
          </a>
        </section>

        <section className="footer-social" aria-label="Social links">
          <h3>Social</h3>
          <a
            href="https://www.instagram.com/thebloombody_?igsh=MTQxeGc0amYyZ3Q5YQ=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
            <span>Instagram</span>
          </a>
          <a
            href="https://www.tiktok.com/@thebloombody_weightgain"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tiktok"
          >
            <i className="fab fa-tiktok"></i>
            <span>Tiktok</span>
          </a>
          <a href="https://wa.me/2348122112738" target="_blank" rel="noopener noreferrer" aria-label="Whatsapp">
            <i className="fab fa-whatsapp"></i>
            <span>Whatsapp</span>
          </a>
        </section>
      </div>
      <section>
        <hr style={{ color: "#b85c6b", margin: "20px 0", width: "100%"}}></hr>
        <p style={{ alignItems: "center", textAlign: "center", fontWeight: "500" }} >© 2026 <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "20px", color: "#b85c6b" }}>The Bloom Body</span> ❤️ All rights reserved.</p>
      </section>
    </footer>
  );
};

export default Footer;
