<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\Controller;
use App\Models\Kyc;
use App\Models\User;
use App\Notifications\KycApproveNoti;
use App\Notifications\KycRejectNoti;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function index($status)
    {
        try {
            $kycs = Kyc::with('user')->where('status', $status)->orderBy('id', 'desc')->get();
            return view('admin.users.kyc', compact('kycs', 'status'));
        } catch (\Exception $th) {
            return back('error', $th->getMessage());
        }
    }
    public function kycApproval(Request $request)
    {
        try {
            $request->validate([
                'kyc_id' => 'required|exists:kycs,id',
            ]);

            $kyc = Kyc::find($request->kyc_id);
            $kyc->status = $request->action;
            $kyc->save();
            $user = User::find($kyc->user_id);
            if ($request->action == 'approved') {
                $user->notify(new KycApproveNoti());
            }
            if ($request->action == 'rejected') {
                $user->notify(new KycRejectNoti());
            }
            return back()->with('success', 'Kyc update successfully!');
        } catch (\Exception $th) {
            return back()->with('error', $th->getMessage());
        }
    }
}
