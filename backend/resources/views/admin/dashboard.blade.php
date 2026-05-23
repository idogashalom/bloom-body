<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bloom Body - Admin Dashboard</title>
    <style>
        body {
            margin: 0;
            font-family: sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
        }
        .navbar {
            background-color: #db2777;
            color: #fff;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .navbar h1 {
            margin: 0;
            font-size: 1.25rem;
            letter-spacing: 0.05em;
        }
        .nav-right {
            display: flex;
            align-items: center;
        }
        .nav-right span {
            margin-right: 1rem;
        }
        .logout-btn {
            background-color: #9d174d;
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s;
        }
        .logout-btn:hover {
            background-color: #831843;
        }
        .container {
            max-width: 1200px;
            margin: 2.5rem auto 0;
            padding: 1rem;
        }
        .card {
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            border-top: 4px solid #ec4899;
        }
        .card h2 {
            margin-top: 0;
            font-size: 1.5rem;
            color: #1f2937;
        }
        .card p {
            color: #4b5563;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1.5rem;
            margin-top: 1.5rem;
        }
        @media (min-width: 768px) {
            .grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        .stat-card {
            background-color: #fdf2f8;
            padding: 1.5rem;
            border-radius: 0.25rem;
            text-align: center;
            border: 1px solid #fce7f3;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .stat-card h3 {
            margin: 0;
            font-size: 1.125rem;
            color: #9d174d;
        }
        .stat-card p {
            font-size: 1.875rem;
            font-weight: bold;
            color: #1f2937;
            margin: 0.5rem 0 0;
        }
        .notice {
            margin-top: 2rem;
            padding: 1rem;
            background-color: #fefce8;
            border-left: 4px solid #facc15;
            color: #854d0e;
        }
    </style>
</head>
<body>
    
    <nav class="navbar">
        <h1>Bloom Body Admin</h1>
        <div class="nav-right">
            <span>Welcome, {{ auth()->guard('admin')->user()->name ?? 'Admin' }}</span>
            <form action="{{ route('admin.logout') }}" method="POST" style="display:inline;">
                @csrf
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </nav>

    <div class="container">
        <div class="card">
            <h2>Dashboard Overview</h2>
            <p style="margin-bottom: 1.5rem;">Welcome to your new Bloom Body Admin Dashboard! The database is now connected and functioning.</p>
            
            <div class="grid">
                <!-- Placeholder Cards -->
                <div class="stat-card">
                    <h3>Total Orders</h3>
                    <p>0</p>
                </div>
                <div class="stat-card">
                    <h3>Total Products</h3>
                    <p>0</p>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <p>₦0.00</p>
                </div>
            </div>

            <div class="notice">
                <p style="margin:0;"><strong>Note:</strong> The full functionality (Product Management, Orders, Testimonials, Analytics) is the next phase of the implementation plan and will be built out shortly.</p>
            </div>
        </div>
    </div>

</body>
</html>
