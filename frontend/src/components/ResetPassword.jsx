import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import PasswordInput from "./PasswordInput";
import { authApi } from "../services/api";
import "./Auth.css";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setMessage("");

        if (password.length < 8) {
            setMessage("Password must be at least 8 characters long.");
            return;
        }

        if (password !== passwordConfirmation) {
            setMessage("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await authApi.resetPassword({
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setIsSuccess(true);
            setMessage(result.message);

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMessage(error.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell auth-shell-register">
                <div className="auth-brand-panel">
                    <img className="auth-logo" src={Logo} alt="The Bloom Body logo" />
                    <h1 style={{ fontSize: "29px" }}>Create New Password</h1>
                    <p style={{ fontSize: "18px" }}>
                        Enter your new password. Make sure it's at least 8 characters long.
                    </p>
                    <Link className="auth-link-button" to="/login">
                        Back to Login
                    </Link>
                </div>

                <form className="auth-form" onSubmit={handleResetPassword}>
                    <div className="auth-form-header">
                        <img className="auth-form-logo" src={Logo} alt="" />
                        <h2>Reset Password</h2>
                    </div>

                    <label>
                        New Password
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a new password"
                            minLength="8"
                            required
                            disabled={isLoading}
                        />
                    </label>

                    <label>
                        Confirm Password
                        <PasswordInput
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Confirm your password"
                            minLength="8"
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
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default ResetPassword;
