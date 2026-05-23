import React, { useEffect, useState } from "react";
import "./Toast.css";

const Toast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const id = Date.now() + Math.random();
            const payload = { id, message: e.detail?.message || "", duration: e.detail?.duration || 3500 };
            setToasts((t) => [...t, payload]);
            // auto remove
            setTimeout(() => {
                setToasts((t) => t.filter((x) => x.id !== id));
            }, payload.duration);
        };

        window.addEventListener("bloom-toast", handler);
        return () => window.removeEventListener("bloom-toast", handler);
    }, []);

    if (!toasts.length) return null;

    return (
        <div className="bloom-toast-wrapper" aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className="bloom-toast">
                    {t.message}
                </div>
            ))}
        </div>
    );
};

export default Toast;
