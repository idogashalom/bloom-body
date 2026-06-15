import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import { useShop } from "../context/ShopContext";
import PasswordInput from "./PasswordInput";
import "./Auth.css";

//this is the login component
function Login() {
  const navigate = useNavigate();
  const { login } = useShop();
  const [message, setMessage] = useState("");

  //this is the function that handles the submission of the form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const result = await login({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate("/product");
  };

  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell-login">
        <div className="auth-brand-panel">
          <img className="auth-logo" src={Logo} alt="The Bloom Body logo" />
          <h1>Welcome back Bestie</h1>
          <p>
            Sign in to continue your Bloom Body routine and pick up right where
            your glow list left off.
          </p>
          <Link className="auth-link-button" to="/register">
            Create a new account
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">
            <img className="auth-form-logo" src={Logo} alt="" />
            <h2>Login</h2>
          </div>

          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <PasswordInput name="password" placeholder="Your password" required />
          </label>

          <a className="auth-forgot-link" href="#">
            Forgot your password?
          </a>

          {message && <p className="auth-message">{message}</p>}

          <button type="submit">Sign In</button>
        </form>
      </section>
    </main>
  );
}

export default Login;
