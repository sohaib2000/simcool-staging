<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminPermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $permission = null): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to access admin panel.');
        }

        $userEmail = Auth::user()->email;

        // Get restricted emails from config
        $restrictedEmails = config('admin_permissions.restricted_emails', []);
        $isRestrictedUser = in_array($userEmail, $restrictedEmails);

        if (!$permission) {
            $permission = $this->getPermissionFromRequest($request);
        }

        $restrictedActions = config('admin_permissions.restricted_actions', []);

        if ($isRestrictedUser && in_array($permission, $restrictedActions)) {
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to perform this action.',
                    'error' => 'Access denied'
                ], 403);
            }

            return redirect()->back()
                ->with('error', 'Access denied! Your account has read-only access.')
                ->withInput();
        }

        return $next($request);
    }

    private function getPermissionFromRequest(Request $request): string
    {
        $method = $request->method();
        $routeName = $request->route()->getName() ?? '';

        switch ($method) {
            case 'POST':
                return 'store';
            case 'PUT':
            case 'PATCH':
                return 'update';
            case 'DELETE':
                return 'delete';
            default:
                if (str_contains($routeName, 'edit') || str_contains($routeName, 'update')) {
                    return 'edit';
                } elseif (str_contains($routeName, 'delete') || str_contains($routeName, 'destroy')) {
                    return 'delete';
                } elseif (str_contains($routeName, 'store') || str_contains($routeName, 'create')) {
                    return 'store';
                } elseif (str_contains($routeName, 'export')) {
                    return 'export';
                }
                return 'view';
        }
    }
}
