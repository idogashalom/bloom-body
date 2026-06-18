import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import { ordersApi, notificationsApi } from "../services/api";
import { useShop } from "../context/ShopContext";
import "./Dashboard.css";

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getOrderAmount = (order) => {
    const amount = order.total ?? order.amount ?? order.grand_total ?? order.price ?? order.order_total;
    if (typeof amount === "number") return amount;
    if (typeof amount === "string") return Number(String(amount).replace(/[^\d.]/g, "")) || 0;
    return 0;
};

const getOrderItemsCount = (order) => {
    return (
        order.items?.length || order.order_items?.length || order.products?.length || order.quantity || 0
    );
};

const getOrderStatus = (order) => {
    return (
        order.status || order.order_status || order.current_status || "Pending"
    );
};

const getOrderNumber = (order) => {
    return order.order_number || order.number || order.id || "#000";
};

const Dashboard = () => {
    const { currentUser, isLoggedIn, logout, updateProfile } = useShop();
    const navigate = useNavigate();
    const { tab } = useParams();
    const activeTab = tab || "overview";
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [profileData, setProfileData] = useState({ name: "", email: "" });
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordMessage, setPasswordMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { replace: true });
            return;
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        setProfileData({
            name: currentUser?.name || currentUser?.fullName || "",
            email: currentUser?.email || "",
        });
    }, [currentUser]);

    useEffect(() => {
        let active = true;
        const fetchOrders = async () => {
            setLoadingOrders(true);
            setOrderError(null);
            try {
                const data = await ordersApi.getOrders();
                if (!active) return;
                const raw = Array.isArray(data) ? data : [];
                const filtered = raw.filter((order) => {
                    const email = currentUser?.email?.toLowerCase();
                    const orderEmail = (order.user?.email || order.email || order.customer_email || order.user_email || "")
                        .toString()
                        .toLowerCase();
                    return email ? orderEmail === email : true;
                });
                setOrders(filtered);
            } catch (error) {
                if (!active) return;
                setOrderError(error.message || "Unable to load orders.");
            } finally {
                if (active) setLoadingOrders(false);
            }
        };

        fetchOrders();
        return () => {
            active = false;
        };
    }, [currentUser]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("bloomReadNotifications");
            if (stored) {
                setReadNotifications(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to parse read notifications", e);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const fetchNotifs = async () => {
            try {
                const [data, deliveryData] = await Promise.all([
                    notificationsApi.getAll(),
                    ordersApi.getDeliveryNotifications(),
                ]);
                if (!active) return;
                const deliveryNotifications = Array.isArray(deliveryData)
                    ? deliveryData.map((order) => ({
                        id: `delivery-${order.id}`,
                        title: "Its delivery day bestie ðŸ’•",
                        message: `Your order ${getOrderNumber(order)} is on the way today.`,
                        created_at: order.delivery_date || new Date().toISOString(),
                    }))
                    : [];
                setNotifications([...deliveryNotifications, ...(Array.isArray(data) ? data : [])]);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        if (isLoggedIn) {
            fetchNotifs();
        }
        return () => { active = false; };
    }, [isLoggedIn, currentUser]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !readNotifications.includes(n.id)).length;
    }, [notifications, readNotifications]);

    const markAsRead = (id) => {
        if (!readNotifications.includes(id)) {
            const newRead = [...readNotifications, id];
            setReadNotifications(newRead);
            localStorage.setItem("bloomReadNotifications", JSON.stringify(newRead));
        }
    };

    const loyaltyPoints = useMemo(() => {
        const points = currentUser?.loyalty_points ?? currentUser?.points ?? 0;
        return typeof points === "number" ? points : Number(points) || 0;
    }, [currentUser]);

    const memberSinceYear = useMemo(() => {
        const dateValue = currentUser?.created_at || currentUser?.createdAt || currentUser?.joined_at || currentUser?.registered_at;
        const date = dateValue ? new Date(dateValue) : new Date();
        return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
    }, [currentUser]);

    const initials = useMemo(() => {
        const name = currentUser?.name || currentUser?.fullName || currentUser?.full_name || "Member";
        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [currentUser]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.created_at || b.createdAt || Date.now()) - new Date(a.created_at || a.createdAt || Date.now()))
            .slice(0, 3);
    }, [orders]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        setFormError("");
        setPasswordMessage("");
        const cleanName = profileData.name.trim();
        const cleanEmail = profileData.email.trim().toLowerCase();

        if (!cleanName || !cleanEmail) {
            setFormError("Name and email are required.");
            return;
        }

        const { currentPassword, newPassword, confirmPassword } = passwordData;

        const isChangingPassword = currentPassword || newPassword || confirmPassword;

        if (isChangingPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                setFormError("Please complete all password fields before saving.");
                return;
            }

            if (newPassword !== confirmPassword) {
                setFormError("New password and confirmation do not match.");
                return;
            }

            if (newPassword.length < 8) {
                setFormError("New password must be at least 8 characters.");
                return;
            }
        }

        const result = await updateProfile({
            name: cleanName,
            email: cleanEmail,
            currentPassword,
            newPassword,
            confirmPassword,
        });
        if (!result.ok) {
            setFormError(result.message || "Unable to update profile.");
            return;
        }

        setPasswordMessage(result.message || "Profile updated successfully.");
        if (isChangingPassword) {
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
    };

    return (
        <main className="dashboard-page">
            <div className="dashboard-shell">
                <aside className="dashboard-sidebar">
                    <div className="dashboard-user-card">
                        <div className="dashboard-avatar">{initials}</div>
                        <div className="dashboard-user-meta">
                            <h2>{currentUser?.name || currentUser?.fullName || "Member"}</h2>
                            <p>Member since {memberSinceYear}</p>
                        </div>
                    </div>
                    <hr className="dashboard-sidebar-divider" style={{BackgroundColor: 'var(--deep-pink)' }} />
<div className="dashboard-stats">
                    <NavLink to="/dashboard/overview" style={({ isActive }) => ({
                        padding: '13px 20px', borderRadius: 0, textDecoration: 'none', width: '100%',
                        backgroundColor: isActive ? '#fff' : 'transparent', color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
                        fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s',
                        BoxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)', display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px'
                    })}>Overview</NavLink>

                    <NavLink to="/dashboard/orders" style={({ isActive }) => ({
                        padding: '13px 20px', borderRadius: 0, textDecoration: 'none', width: '100%',
                        backgroundColor: isActive ? '#fff' : 'transparent', color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
                        fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s',
                        BoxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)', display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px'
                    })}>My Orders</NavLink>

                    <NavLink to="/dashboard/notifications" style={({ isActive }) => ({
                        padding: '13px 20px', borderRadius: 0, textDecoration: 'none', width: '100%',
                        backgroundColor: isActive ? '#fff' : 'transparent', color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
                        fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s',
                            BoxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',  display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '14px'
                    })}>Notifications</NavLink>

                    <NavLink to="/dashboard/profile" style={({ isActive }) => ({
                        padding: '13px 20px', borderRadius: 0, textDecoration: 'none',width: '100%',
                        backgroundColor: isActive ? '#fff' : 'transparent',
                        color: isActive ? 'var(--deep-pink)' : 'var(--text-dark)',
                        fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s',
                        BoxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)', display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '14px'
                    })}>Profile settings</NavLink>
</div>

                    {/* <button type="button" className="dashboard-logout-button" onClick={handleLogout}>
                        <span className="dashboard-menu-logout"></span>
                        Logout
                    </button> */}
                </aside>

                <section className="dashboard-content">
                    <header className="dashboard-top-bar">
                        <div className="dashboard-bell-container">
                            <button 
                                type="button" 
                                className="dashboard-bell-btn"
                                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                            >
                                <i className="fas fa-bell"></i> {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>
                            {showNotificationDropdown && (
                                <div className="notification-dropdown">
                                    <div className="notification-dropdown-header">
                                        <h3>Notifications</h3>
                                        <button type="button" onClick={() => setShowNotificationDropdown(false)}>✕</button>
                                    </div>
                                    <div className="notification-dropdown-list">
                                        {notifications.length === 0 ? (
                                            <div className="notification-dropdown-empty">No notifications yet.</div>
                                        ) : (
                                            notifications.map(n => {
                                                const isRead = readNotifications.includes(n.id);
                                                return (
                                                    <div 
                                                        key={n.id} 
                                                        className={`notification-dropdown-item ${isRead ? 'read' : 'unread'}`}
                                                        onClick={() => markAsRead(n.id)}
                                                    >
                                                        <h4>{n.title}</h4>
                                                        {n.message && <p className="notification-msg">{n.message}</p>}
                                                        <span className="notification-time">{formatDate(n.created_at)}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="notification-dropdown-footer">
                                        <button type="button" onClick={() => {
                                            setShowNotificationDropdown(false);
                                            navigate("/dashboard/notifications");
                                        }}>
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    {activeTab === "overview" && (
                        <>
                            <div className="dashboard-card dashboard-welcome-card">
                                <div>
                                    <p className="dashboard-subtitle">Welcome back, {currentUser?.name || currentUser?.fullName || "friend"}!</p>
                                    <h1 >Stay consistent, stay motivated, and keep building the body you deserve.</h1>
                                </div>
                                <div className="dashboard-stats-grid">
                                    <div className="dashboard-stat-card">
                                        <span>Total Orders</span>
                                        <strong>{orders.length}</strong>
                                    </div>
                                    <div className="dashboard-stat-card">
                                        <span>Loyalty Points</span>
                                        <strong>{loyaltyPoints}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-card dashboard-orders-card">
                                <div className="dashboard-section-header">
                                    <div>
                                        <h2>Recent Orders</h2>
                                        <p>Review your latest order activity.</p>
                                    </div>
                                    <button type="button" className="view-btn dashboard-view-all" onClick={() => navigate("/dashboard/orders")}>View All</button>
                                </div>
                                {loadingOrders ? (
                                    <div className="dashboard-loading">Loading orders...</div>
                                ) : orderError ? (
                                    <div className="dashboard-empty-state">{orderError}</div>
                                ) : recentOrders.length === 0 ? (
                                    <div className="dashboard-empty-state">You have no recent orders yet.</div>
                                ) : (
                                    <div className="dashboard-order-cards">
                                        {recentOrders.map((order) => (
                                            <article className="dashboard-order-card" key={getOrderNumber(order)}>
                                                <div className="dashboard-order-card-main">
                                                    <div>
                                                        <p className="dashboard-order-title">Order {getOrderNumber(order)}</p>
                                                        <p>{formatDate(order.created_at || order.createdAt || order.date)}</p>
                                                    </div>
                                                    <div className="dashboard-order-amount">₦{getOrderAmount(order).toLocaleString()}</div>
                                                </div>
                                                <div className="dashboard-order-card-footer">
                                                    <span>{getOrderItemsCount(order)} item{getOrderItemsCount(order) !== 1 ? "s" : ""}</span>
                                                    <span className={`dashboard-order-status status-${getOrderStatus(order).toLowerCase()}`}>{getOrderStatus(order)}</span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "orders" && (
                        <div className="dashboard-card dashboard-orders-full">
                            <div className="dashboard-section-header">
                                <div>
                                    <h2>My Orders</h2>
                                    <p>Track order status, totals, and details in one place.</p>
                                </div>
                                <button type="button" className="view-btn dashboard-view-all" onClick={() => navigate("/dashboard/overview")}>Back to Overview</button>
                            </div>
                            {loadingOrders ? (
                                <div className="dashboard-loading">Loading orders...</div>
                            ) : orderError ? (
                                <div className="dashboard-empty-state">{orderError}</div>
                            ) : orders.length === 0 ? (
                                <div className="dashboard-empty-state">No orders found yet. Place an order to see it here.</div>
                            ) : (
                                <div className="dashboard-orders-grid">
                                    {orders.map((order) => (
                                        <article className="dashboard-order-item" key={getOrderNumber(order)}>
                                            <div className="dashboard-order-item-header">
                                                <div>
                                                    <p className="dashboard-order-title">Order {getOrderNumber(order)}</p>
                                                    <p>{formatDate(order.created_at || order.createdAt || order.date)}</p>
                                                </div>
                                                <span className={`dashboard-order-status status-${getOrderStatus(order).toLowerCase()}`}>{getOrderStatus(order)}</span>
                                            </div>
                                            <div className="dashboard-order-item-body">
                                                <div>
                                                    <span className="dashboard-order-label">Items</span>
                                                    <strong>{getOrderItemsCount(order)}</strong>
                                                </div>
                                                <div>
                                                    <span className="dashboard-order-label">Total</span>
                                                    <strong>₦{getOrderAmount(order).toLocaleString()}</strong>
                                                </div>
                                            </div>
                                            <button type="button" className="view-btn dashboard-order-details">Details</button>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="dashboard-card dashboard-profile-card">
                            <div className="dashboard-section-header">
                                <div>
                                    <h2>Profile Settings</h2>
                                    <p>Manage your account information and security settings.</p>
                                </div>
                            </div>
                            <div className="dashboard-profile-info">
                                <div className="dashboard-profile-field">
                                    <label>Full Name</label>
                                    <div className="dashboard-profile-value">
                                        {currentUser?.name || currentUser?.fullName || "—"} — Member since {memberSinceYear}
                                    </div>
                                </div>
                                <div className="dashboard-profile-field">
                                    <label>Email Address</label>
                                    <div className="dashboard-profile-value">{currentUser?.email || "—"}</div>
                                </div>
                            </div>
                            <form className="dashboard-security-form" onSubmit={handleSaveProfile}>
                                <div className="dashboard-security-grid">
                                    <div className="dashboard-form-field">
                                        <label htmlFor="currentPassword">Current Password</label>
                                        <PasswordInput
                                            id="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={(event) => setPasswordData((prev) => ({ ...prev, currentPassword: event.target.value }))}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="dashboard-form-field">
                                        <label htmlFor="newPassword">New Password</label>
                                        <PasswordInput
                                            id="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={(event) => setPasswordData((prev) => ({ ...prev, newPassword: event.target.value }))}
                                            placeholder="Create a new password"
                                        />
                                    </div>
                                    <div className="dashboard-form-field">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <PasswordInput
                                            id="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={(event) => setPasswordData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                {formError && <div className="dashboard-form-error">{formError}</div>}
                                {passwordMessage && <div className="dashboard-form-success">{passwordMessage}</div>}
                                <button type="submit" className="view-btn dashboard-save-button">Save All Changes</button>
                            </form>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="dashboard-card dashboard-notifications-full">
                            <div className="dashboard-section-header">
                                <div>
                                    <h2>Notifications</h2>
                                    <p>Stay up to date with the latest announcements and updates.</p>
                                </div>
                            </div>
                            {notifications.length === 0 ? (
                                <div className="dashboard-empty-state">No notifications found.</div>
                            ) : (
                                <div className="dashboard-notifications-grid">
                                    {notifications.map((n) => {
                                        const isRead = readNotifications.includes(n.id);
                                        return (
                                            <article 
                                                className={`dashboard-notification-item ${isRead ? 'read' : 'unread'}`} 
                                                key={n.id}
                                                onClick={() => markAsRead(n.id)}
                                            >
                                                <div className="dashboard-notification-item-header">
                                                    <div>
                                                        <h3 className="dashboard-notification-title">{n.title}</h3>
                                                        <p className="dashboard-notification-date">{formatDate(n.created_at)}</p>
                                                    </div>
                                                    {!isRead && <span className="dashboard-notification-status status-unread">New</span>}
                                                </div>
                                                <div className="dashboard-notification-item-body">
                                                    {n.message && <p>{n.message}</p>}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Mobile bottom navigation bar */}
            <nav className="dashboard-mobile-nav">
                <NavLink to="/dashboard/overview" className="mobile-nav-item">
                    <i className="fas fa-th-large"></i>
                    <span>Overview</span>
                </NavLink>
                <NavLink to="/dashboard/orders" className="mobile-nav-item">
                    <i className="fas fa-shopping-bag"></i>
                    <span>My Orders</span>
                </NavLink>
                <NavLink to="/dashboard/notifications" className="mobile-nav-item">
                    <i className="fas fa-bell"></i>
                    <span>Inbox</span>
                </NavLink>
                <NavLink to="/dashboard/profile" className="mobile-nav-item">
                    <i className="fas fa-user"></i>
                    <span>You</span>
                </NavLink>
            </nav>
        </main>
    );
};

export default Dashboard;
