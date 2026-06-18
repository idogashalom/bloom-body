import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/bloom-logo.png";
import { authApi } from "../services/api";
import "./Auth.css";

function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (resendTimer === 0 && message.includes("sent")) {
            setCanResend(true);
        }
    }, [resendTimer, message]);

    const handleVerifyOtp = async (event) => {
        event.preventDefault();
        setMessage("");
        setIsLoading(true);

        if (otp.length !== 6) {
            setMessage("Please enter a 6-digit verification code.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await authApi.verifyOtp({ email, otp });
            setIsSuccess(true);
            setMessage(result.message);

            // Redirect to reset password page after 2 seconds
            setTimeout(() => {
                navigate("/reset-password", { state: { email } });
            }, 2000);
        } catch (error) {
            setMessage(error.message || "Invalid or expired verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setMessage("");
        setIsLoading(true);
        setCanResend(false);
        setResendTimer(60);

        try {
            const result = await authApi.resendOtp({ email });
            setMessage(result.message);
        } catch (error) {
            setMessage(error.message || "Failed to resend verification code. Please try again.");
            setCanResend(true);
            setResendTimer(0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell auth-shell-register">
                <div className="auth-brand-panel">
                    <img className="auth-logo" src={Logo} alt="The Bloom Body logo" />
                    <h1 style={{ fontSize: "29px" }}>Verify Your Email</h1>
                    <p style={{ fontSize: "18px" }}>
                        Enter the verification code we sent to your email address.
                    </p>
                    <Link className="auth-link-button" to="/login">
                        Back to Login
                    </Link>
                </div>

                <form className="auth-form" onSubmit={handleVerifyOtp}>
                    <div className="auth-form-header">
                        <img className="auth-form-logo" src={Logo} alt="" />
                        <h2>Verify Code</h2>
                    </div>

                    <p style={{ textAlign: "center", color: "var(--text-dark)", fontSize: "14px" }}>
                        Code sent to: <strong>{email}</strong>
                    </p>

                    <label>
                        Verification Code
                        <input
                            type="text"
                            inputMode="numeric"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            maxLength="6"
                            required
                            disabled={isLoading}
                            style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px" }}
                        />
                    </label>

                    {message && (
                        <p className={`auth-message ${isSuccess ? 'auth-message-success' : ''}`}>
                            {message}
                        </p>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: "12px" }}>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={!canResend || isLoading}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: canResend ? "var(--deep-pink)" : "#ccc",
                                cursor: canResend ? "pointer" : "not-allowed",
                                textDecoration: "underline",
                                fontSize: "14px",
                                fontFamily: "'Great Vibes', cursive",
                            }}
                        >
                            {canResend
                                ? "Resend Code"
                                : `Resend Code in ${resendTimer}s`}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default VerifyOTP;
