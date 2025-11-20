<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EsimOrder;
use App\Models\User;
use App\Models\UserEsim;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::query()->withTrashed()->where('role', '!=', 'admin');

            // 🔍 Search by name/email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // ✅ Filter by Status
            if ($request->filled('status')) {
                if ($request->status === 'active') {
                    $query->where('is_active', 1)->whereNull('deleted_at');
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', 0)->whereNull('deleted_at');
                } elseif ($request->status === 'deleted') {
                    $query->onlyTrashed();
                }
            }

            // ✅ Filter by KYC Status
            if ($request->filled('kyc_status')) {
                if ($request->kyc_status === 'approved') {
                    $query->whereHas('kycs', function ($q) {
                        $q->where('status', 'approved');
                    });
                } elseif ($request->kyc_status === 'pending') {
                    $query->whereDoesntHave('kycs')
                        ->orWhereHas('kycs', function ($q) {
                            $q->where('status','pending');
                        });
                } elseif ($request->kyc_status === 'rejected') {
                    $query->whereDoesntHave('kycs')
                        ->orWhereHas('kycs', function ($q) {
                            $q->where('status','rejected');
                        });
                }
            }

            // ✅ Paginate with filters preserved
            $users = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

            return view('admin.users.index', compact('users'));
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }


    public function details(Request $request, $id)
    {
        try {
            $user = User::findorFail($id);
            $esimQuery = UserEsim::query();
            $activeEsim = $esimQuery->where('user_id', $user->id)->where('status', 'ACTIVE')->count();
            $inActiveEsim = $esimQuery->where('user_id', $user->id)->where('status', 'NOT_ACTIVE')->count();
            return view('admin.users.details', compact('user', 'activeEsim', 'inActiveEsim'));
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
    public function AddWalletAmount(Request $request)
    {
        try {
            $userId = $request->user_id;
            $amount = $request->amount;
            $description = 'Amount credit by Admin';
            $result = addWalletAmount($userId, $amount, 'credit', $description);
            if ($result) {
                return response()->json(['message' => 'Amount added successfully.'], 200);
            } else {
                return response()->json([
                    'message' => 'Failed to add amount.',
                    'status' => 400,
                ], 400);
            }
        } catch (\Exception $th) {
            return response()->json([
                'message' => $th->getMessage(),
                'status' => 500,
            ], 500);
        }
    }
}
