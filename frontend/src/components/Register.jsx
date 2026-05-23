import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import { useShop } from "../context/ShopContext";
import "./Auth.css";

//this is the function that handles the registration
function Register() {
  const navigate = useNavigate();
  const { register } = useShop();
  const [message, setMessage] = useState("");

  //this is the function that handles the submission of the form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    //this is the function that registers the user
    const result = await register({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    //this is the function that checks if the result is ok
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate("/product");
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-register">
        <div className="auth-brand-panel">
          <img className="auth-logo" src={Logo} alt="The Bloom Body logo" />
          <h1 style={{ alignItems: "center", letterSpacing: "0", fontSize:"29px" }}>Start your Bloom<span>🌸</span>journey</h1>
          <p style={{fontSize:"18px", }}>
            Create your Bloom Body account and start your journey to a healthy fuller you.
          </p>
          <Link className="auth-link-button" to="/login">
            Already have an account?
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">
            <img className="auth-form-logo" src={Logo} alt="" />
            <h2>Create An Account</h2>
          </div>

          <label>
            Name
            <input type="text" name="name" placeholder="Your name" required />
          </label>

          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" name="password" placeholder="Create a password" minLength="6" required />
          </label>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit">Sign Up</button>
        </form>
      </section>
    </main>
  );
}

export default Register;
