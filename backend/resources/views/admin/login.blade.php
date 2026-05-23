<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bloom Body - Admin Login</title>
    <style>
        body {
            margin: 0;
            font-family: sans-serif;
            background-color: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-card {
            background-color: #fff;
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: 100%;
            max-width: 28rem;
            border-top: 4px solid #ec4899;
            box-sizing: border-box;
        }
        .text-center { text-align: center; }
        .title {
            font-size: 1.875rem;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
        }
        .subtitle {
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.5rem;
            margin-bottom: 2rem;
        }
        .error-alert {
            background-color: #fee2e2;
            border: 1px solid #f87171;
            color: #b91c1c;
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            margin-bottom: 1rem;
        }
        .error-alert ul { margin: 0; padding-left: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group.mb-6 { margin-bottom: 1.5rem; }
        .label {
            display: block;
            color: #374151;
            font-size: 0.875rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .input-field {
            width: 100%;
            padding: 0.5rem 0.75rem;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            box-sizing: border-box;
            outline: none;
            transition: box-shadow 0.2s;
        }
        .input-field:focus {
            box-shadow: 0 0 0 2px #f472b6;
        }
        .bloom-btn { 
            background-color: #e91e63;
            color: #fff;
            font-weight: bold;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            width: 100%;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
            font-size: 1rem;
        }
        .bloom-btn:hover { background-color: #d81b60; }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="text-center">
            <h1 class="title">Bloom Body</h1>
            <p class="subtitle">Admin Dashboard Login</p>
        </div>

        @if ($errors->any())
            <div class="error-alert">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('admin.login.submit') }}">
            @csrf
            <div class="form-group">
                <label class="label" for="email">Email Address</label>
                <input class="input-field" id="email" type="email" name="email" value="{{ old('email') }}" required autofocus>
            </div>
            
            <div class="form-group mb-6">
                <label class="label" for="password">Password</label>
                <input class="input-field" id="password" type="password" name="password" required>
            </div>
            
            <div>
                <button class="bloom-btn" type="submit">
                    Sign In to Dashboard
                </button>
            </div>
        </form>
    </div>

</body>
</html>
