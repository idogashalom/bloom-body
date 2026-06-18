import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import { authApi } from "../services/api";
import "./Auth.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const result = await authApi.forgotPassword({ email });
            setIsSuccess(true);
            setMessage(result.message);

            // Redirect to OTP verification page after 2 seconds
            setTimeout(() => {
                navigate("/verify-otp", { state: { email } });
            }, 2000);
        } catch (error) {
            setMessage(error.message || "Failed to send verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell auth-shell-register">
                <div className="auth-brand-panel">
                    <img className="auth-logo" src={Logo} alt="The Bloom Body logo" />
                    <h1 style={{ fontSize: "29px" }}>Reset Your Password</h1>
                    <p style={{ fontSize: "18px" }}>
                        Enter your email address and we'll send you a verification code to reset your password.
                    </p>
                    <Link className="auth-link-button" to="/login">
                        Back to Login
                    </Link>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form-header">
                        <img className="auth-form-logo" src={Logo} alt="" />
                        <h2>Forgot Password</h2>
                    </div>

                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                        />
                    </label>

                    {message && (
                        <p className={`auth-message ${isSuccess ? 'auth-message-success' : ''}`}>
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Verification Code"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ForgotPassword;
