import { useEffect, useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import { ordersApi } from "../services/api";
import "./DeliveryNotification.css";

const todayKey = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const DeliveryNotification = () => {
  const { isLoggedIn } = useShop();
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [dismissedKey, setDismissedKey] = useState(() => localStorage.getItem("bloomDeliveryNoticeDismissed") || "");

  const noticeKey = useMemo(() => {
    if (!deliveryOrders.length) return "";
    return `${todayKey()}:${deliveryOrders.map((order) => order.order_number).join(",")}`;
  }, [deliveryOrders]);

  useEffect(() => {
    if (!isLoggedIn) {
      setDeliveryOrders([]);
      return;
    }

    let mounted = true;
    const fetchDeliveryOrders = async () => {
      try {
        const data = await ordersApi.getDeliveryNotifications();
        if (mounted) {
          setDeliveryOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  if (!noticeKey || dismissedKey === noticeKey) return null;

  const dismissNotice = () => {
    localStorage.setItem("bloomDeliveryNoticeDismissed", noticeKey);
    setDismissedKey(noticeKey);
  };

  return (
    <div className="delivery-notice" role="status" aria-live="polite">
      <button className="delivery-notice-close" type="button" aria-label="Dismiss delivery notification" onClick={dismissNotice}>
        x
      </button>
      <div className="delivery-road" aria-hidden="true">
        <div className="delivery-car">
          <div className="delivery-box"></div>
          <div className="delivery-car-body"></div>
          <div className="delivery-car-window"></div>
          <div className="delivery-wheel delivery-wheel-front"></div>
          <div className="delivery-wheel delivery-wheel-back"></div>
        </div>
      </div>
      <p>Its delivery day bestie 💕</p>
    </div>
  );
};

export default DeliveryNotification;
