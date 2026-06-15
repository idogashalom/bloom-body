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
        .password-field {
            position: relative;
        }
        .password-field .input-field {
            padding-right: 2.75rem;
        }
        .password-toggle {
            position: absolute;
            top: 50%;
            right: 0.5rem;
            display: inline-grid;
            width: 2rem;
            height: 2rem;
            padding: 0;
            place-items: center;
            border: 0;
            color: #e91e63;
            background: transparent;
            box-shadow: none;
            cursor: pointer;
            transform: translateY(-50%);
            transition: none;
        }
        .password-toggle:hover,
        .password-toggle:focus,
        .password-toggle:focus-visible {
            color: #e91e63;
            background: transparent;
            box-shadow: none;
            outline: none;
            transform: translateY(-50%);
        }
        .password-toggle svg {
            width: 1rem;
            height: 1rem;
            fill: none;
            stroke: currentColor;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 2;
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
                <div class="password-field">
                    <input class="input-field" id="password" type="password" name="password" required>
                    <button class="password-toggle" type="button" aria-label="Show password" aria-pressed="false" title="Show password">
                        <svg class="eye-off-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 3l18 18"></path>
                            <path d="M10.6 10.6a2 2 0 002.8 2.8"></path>
                            <path d="M9.9 4.2A10.6 10.6 0 0112 4c5.5 0 9 8 9 8a16.2 16.2 0 01-2 3"></path>
                            <path d="M6.6 6.6C4.4 8.1 3 12 3 12s3.5 8 9 8a9.8 9.8 0 005.4-1.7"></path>
                        </svg>
                        <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true" hidden>
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div>
                <button class="bloom-btn" type="submit">
                    Sign In to Dashboard
                </button>
            </div>
        </form>
    </div>

    <script>
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.querySelector('.password-toggle');
        const eyeIcon = passwordToggle.querySelector('.eye-icon');
        const eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');

        passwordToggle.addEventListener('click', function () {
            const isVisible = passwordInput.type === 'text';
            passwordInput.type = isVisible ? 'password' : 'text';
            eyeIcon.hidden = isVisible;
            eyeOffIcon.hidden = !isVisible;
            passwordToggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
            passwordToggle.setAttribute('aria-pressed', String(!isVisible));
            passwordToggle.title = isVisible ? 'Show password' : 'Hide password';
        });
    </script>
</body>
</html>
