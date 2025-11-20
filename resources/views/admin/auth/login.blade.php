<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - {{systemflag('appName')}} | Admin</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <!-- Google Fonts - Inter for a clean look -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="{{asset(systemflag('favicon'))}}">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at top left, #a7e0ff 0%, transparent 40%),
                radial-gradient(circle at bottom right, #ffb3b3 0%, transparent 40%),
                #e0f2fe;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .card-glow-bs {
            box-shadow: 0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1), 0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease-in-out;
            border-radius: 1rem !important;
            border: 1px solid #e2e8f0;
        }

        .card-glow-bs:hover {
            box-shadow: 0 1.25rem 1.5625rem -0.3125rem rgba(0, 0, 0, 0.15), 0 0.625rem 0.625rem -0.3125rem rgba(0, 0, 0, 0.08);
            transform: translateY(-0.125rem);
        }

        .btn-gradient-bs {
            background: linear-gradient(to right, #4F46E5, #6366F1);
            border: none;
            transition: all 0.3s ease;
            padding: 0.875rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 700;
        }

        .btn-gradient-bs:hover {
            background: linear-gradient(to right, #6366F1, #4F46E5);
            transform: translateY(-0.0625rem);
            box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
        }

        input::placeholder {
            color: #9ca3af;
            opacity: 1;
        }
    </style>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet" />
</head>

<body>
    <div class="bg-white p-5 card-glow-bs" style="max-width: 480px; width: 100%;">
        <!-- Logo -->
        <div class="text-center mb-4">
            <img src="{{ asset(systemflag('favicon')) }}" alt="Logo" style="max-height: 60px;">
        </div>

        <h2 class="display-6 fw-bolder text-center text-dark mb-3">Welcome Back!</h2>
        <p class="text-center text-muted mb-4">Sign in to your account</p>

        <form method="POST" id="loginForm">
            @csrf
            <!-- Email Address -->
            <div class="mb-4">
                <label for="email" class="form-label text-dark fs-6 fw-semibold mb-2">Email Address</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value="{{ old('email') }}"
                    required
                    autofocus
                    class="form-control form-control-lg {{ $errors->has('email') ? 'is-invalid' : '' }}"
                    placeholder="Enter your email">
                @if ($errors->has('email'))
                <div class="invalid-feedback">{{ $errors->first('email') }}</div>
                @endif
            </div>

            <!-- Password -->
            <div class="mb-4">
                <label for="password" class="form-label text-dark fs-6 fw-semibold mb-2">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autocomplete="current-password"
                    class="form-control form-control-lg {{ $errors->has('password') ? 'is-invalid' : '' }}"
                    placeholder="Enter your password">
                @if ($errors->has('password'))
                <div class="invalid-feedback">{{ $errors->first('password') }}</div>
                @endif
            </div>

            <!-- Submit Button -->
            <div class="d-grid gap-2 mt-4">
                <button type="submit" class="btn btn-lg btn-gradient-bs text-white">
                    Log In Securely
                </button>
            </div>
        </form>

    </div>

    <!-- Bootstrap Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <script src="{{ asset('assets/js/core/jquery-3.7.1.min.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script>
        toastr.options = {
            "positionClass": "toast-top-right",
            "progressBar": true,
            "closeButton": true,
        };
        $('#loginForm').on('submit', function(e) {
            e.preventDefault();

            let formData = new FormData(this);
            $('.form-control').removeClass('is-invalid');

            $.ajax({
                url: "{{ route('login') }}",
                method: 'POST',
                data: formData,
                contentType: false,
                processData: false,

                success: function(response) {
                    toastr.success(response.message || 'Login successful');
                    setTimeout(() => {
                        window.location.href = "{{route('admin.dashboard')}}";
                    }, 1500);
                },

                error: function(xhr) {
                    if (xhr.status === 422) {
                        const errors = xhr.responseJSON.errors;
                        for (let field in errors) {
                            toastr.error(errors[field][0]);
                        }
                    } else if (xhr.status === 401) {
                        toastr.error(xhr.responseJSON?.message || 'Invalid credentials.');
                    } else {
                        toastr.error('Something went wrong. Please try again.');
                    }
                }
            });
        });
        $(document).on('click', '.copy-btn', function() {
            let target = $(this).data('copy');
            let text = $(target).text().trim();

            navigator.clipboard.writeText(text).then(() => {
                toastr.success("Copied: " + text);
            }).catch(() => {
                toastr.error("Failed to copy!");
            });
        });
    </script>
</body>

</html>
