import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PolicyImage from "../assets/bloom-policy.jpeg";
import { useShop } from "../context/ShopContext";
import { notificationsApi } from "../services/api";
import "./BloomModals.css";

const BloomModals = () => {
  const {
    authPromptOpen,
    setAuthPromptOpen,
    policyPromptOpen,
    setPolicyPromptOpen,
    agreeToPolicy,
  } = useShop();
  const [siteNotification, setSiteNotification] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const data = await notificationsApi.getAll();
        const latest = Array.isArray(data) ? data[0] : null;
        const dismissedId = localStorage.getItem("bloomDismissedNotification");
        if (mounted && latest && String(latest.id) !== dismissedId) {
          setSiteNotification(latest);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const dismissNotification = () => {
    if (siteNotification?.id) {
      localStorage.setItem("bloomDismissedNotification", String(siteNotification.id));
    }
    setSiteNotification(null);
  };

  return (
    <>
      {siteNotification && (
        <div className="bloom-modal-overlay" role="dialog" aria-modal="true">
          <div className="bloom-modal">
            <button
              className="bloom-modal-close"
              type="button"
              aria-label="Close notification"
              onClick={dismissNotification}
            >
              x
            </button>
            <h2>{siteNotification.title}</h2>
            {siteNotification.message && <p>{siteNotification.message}</p>}
            {siteNotification.type === "banner" && siteNotification.image && (
              <img className="bloom-policy-image" src={siteNotification.image} alt={siteNotification.title} />
            )}
            {siteNotification.type === "video" && siteNotification.image && (
              <video className="bloom-policy-image" src={siteNotification.image} controls />
            )}
            <button className="bloom-modal-button" type="button" onClick={dismissNotification}>
              Close
            </button>
          </div>
        </div>
      )}

      {authPromptOpen && (
        <div className="bloom-modal-overlay" role="dialog" aria-modal="true">
          <div className="bloom-modal">
            <button
              className="bloom-modal-close"
              type="button"
              aria-label="Close login request"
              onClick={() => setAuthPromptOpen(false)}
            >
              x
            </button>
            <h2>Login first, bestie</h2>
            <p>Please login or create your Bloom Body account before adding items or placing an order.</p>
            <div className="bloom-modal-actions">
              <Link className="bloom-modal-button" to="/login" onClick={() => setAuthPromptOpen(false)}>
                Login
              </Link>
              <Link
                className="bloom-modal-button bloom-modal-button-soft"
                to="/register"
                onClick={() => setAuthPromptOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {policyPromptOpen && (
        <div className="bloom-modal-overlay" role="dialog" aria-modal="true">
          <div className="bloom-modal bloom-policy-modal">
            <button
              className="bloom-modal-close"
              type="button"
              aria-label="Close terms and policy"
              onClick={() => setPolicyPromptOpen(false)}
            >
              x
            </button>
            <h2>Terms & Policy</h2>
            <img className="bloom-policy-image" src={PolicyImage} alt="Bloom Body terms and policy" />
            <button className="bloom-modal-button" type="button" onClick={agreeToPolicy}>
              I Agree
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BloomModals;
