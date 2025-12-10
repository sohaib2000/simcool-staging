<?php

namespace App\Http\Controllers;

use App\Mail\AllMail;
use App\Models\Kyc;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserDeviceDetail;
use App\Models\UserNotification;
use Carbon\Carbon;
use GrahamCampbell\ResultType\Success;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;
use Auth;

class AuthController extends Controller
{


    public function requestLoginOtp(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);

            $user = User::where('email', $request->email)->first();
            if (!$user) {
                if ($request->refCode) {
                    $refByUser = User::where('refCode', $request->refCode)->first();
                }
                do {
                    try {
                        $user = User::create([
                            'email' => $request->email,
                            'password' => Hash::make(123456),
                            'currencyId' => 16,
                            'refCode' => strtoupper(Str::random(8)),
                            'refBy' => $refByUser->id ?? null
                        ]);
                        $success = true;
                    } catch (QueryException $e) {
                        if ($e->errorInfo[1] === 1062) {
                            $success = false;
                        } else {
                            throw $e;
                        }
                    }
                } while (!$success);
                if ($request->refCode) {
                    PointTransaction::create([
                        'user_id' => $refByUser->id,
                        'from_user_id' => $user->id,
                        'point' => systemflag('referralPoint'),
                        'balance' => 0
                    ]);
                }
            }
            $otp = random_int(1000, 9999);
            $user->otp = bcrypt($otp);
            $user->otp_expires_at = now()->addMinutes(5);
            $user->save();
                $otpTemp = emailTemplate('otpTemplate');
                $companyName = systemflag('appName');
                $template = $otpTemp->description;
                $tempSubject = $otpTemp->subject;
                $data = [
                    'otp' => $otp,
                    'minutes' => 5,
                    'companyName' => $companyName,
                    'date' => date('Y')
                ];

                Mail::to($user->email)->send(new AllMail($template, $data, $tempSubject));

            return response()->json([
                'success' => true,
                'message' => 'OTP has been sent to your email.',
                'data' => [
                    'email' => $user->email,
                ],

            ], 200);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
    public function verifyLoginOtp(Request $request)
    {
        try {
            if ($request->is_firebase_login) {
                $request->validate([
                    'email' => 'required|email',
                ]);
            } else {
                $request->validate([
                    'email' => 'required|email|exists:users,email',
                    'otp' => 'required|digits:4',
                ]);
            }
            if ($request->is_firebase_login) {
                $user = User::where('email', $request->email)->first();
                if (!$user) {
                    if ($request->refCode) {
                        $refByUser = User::where('refCode', $request->refCode)->first();
                    }
                    do {
                        try {
                            $user = User::create([
                                'email' => $request->email,
                                'password' => Hash::make(123456),
                                'currencyId' => 16,
                                'refCode' => strtoupper(Str::random(8)),
                                'refBy' => $refByUser->id ?? null
                            ]);
                            $success = true;
                            UserNotification::create([
                                'user_id' => $user->id,
                                'title' => 'New User Signup ',
                                'type' => 10,
                                'description' => 'New User Registered',
                            ]);
                        } catch (QueryException $e) {
                            if ($e->errorInfo[1] === 1062) {
                                $success = false;
                            } else {
                                throw $e;
                            }
                        }
                    } while (!$success);
                    if ($request->refCode) {
                        PointTransaction::create([
                            'user_id' => $refByUser->id,
                            'from_user_id' => $user->id,
                            'point' => systemflag('referralPoint'),
                            'balance' => 0
                        ]);
                    }
                }
                $token = $user->createToken('auth_firebase_token')->plainTextToken;
                $user->save();
                $deviceDetails = UserDeviceDetail::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'deviceid' => $request->deviceid,
                        'fcmToken' => $request->fcmToken,
                        'deviceLocation' => $request->deviceLocation,
                        'deviceManufacture' => $request->deviceManufacturer,
                        'deviceModel' => $request->deviceModel,
                        'appVersion' => $request->appVersion,
                    ]
                );

                $user->payment_mode = systemflag('paymentMode');
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful.',
                    'data' => [
                        'user' => $user,
                        'referral_point' => systemflag('referralPoint'),
                        'device_details' => $deviceDetails,
                        'token' => $token,
                    ]
                ], 200);
            }
            $user = User::where('email', $request->email)->first();
            if (Hash::check($request->otp, $user->otp) && now()->lessThan($user->otp_expires_at)) {
                $token = $user->createToken('auth_otp_token')->plainTextToken;
                $user->otp = null;
                $user->otp_expires_at = null;
                $user->save();
                $deviceDetails = UserDeviceDetail::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'deviceid' => $request->deviceid,
                        'fcmToken' => $request->fcmToken,
                        'deviceLocation' => $request->deviceLocation,
                        'deviceManufacture' => $request->deviceManufacturer,
                        'deviceModel' => $request->deviceModel,
                        'appVersion' => $request->appVersion,
                    ]
                );
                if ($user->wasRecentlyCreated) {
                    UserNotification::create([
                        'user_id' => $user->id,
                        'title' => 'New User Signup',
                        'type' => 10,
                        'description' => 'New User Registered',
                    ]);
                }
                $user->payment_mode = systemflag('paymentMode');
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful.',
                    'data' => [
                        'user' => $user,
                        'referral_point' => 50,
                        'device_details' => $deviceDetails,
                        'token' => $token,
                    ]
                ], 200);
            }
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.'
            ], 422);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
    public function destroy(Request $request)
    {
        try {
            Auth::guard('api')->user()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
    public function profile(Request $request)
    {
        try {
            $authId = Auth::guard('api')->user()->id;
            $user = User::findOrFail($authId)->load('currency');
            if (!$authId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }
            if ($request->isMethod('post')) {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'currencyId' => 'required|exists:currencies,id',
                    'country' => 'nullable|string',
                    'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
                ]);
                $profile = User::findOrFail($user->id);
                $profile->name = $request->input('name');
                if($request->country){
                    $profile->country = $request->input('country');
                }
                $profile->currencyId = $request->input('currencyId');
                if ($request->hasFile('image')) {
                    $file = $request->file('image');

                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $safeName = Str::slug($originalName);

                    $filename = $safeName . '_' . time() . '.' . $extension;
                    $path = $file->storeAs('images/users', $filename, 'public');
                    $profile->image = 'storage/' . $path;
                }
                $profile->save();
                $profile->payment_mode = systemflag('paymentMode');
                return response()->json([
                    'success' => true,
                    'data' => $profile->load('currency'),
                    'message' => 'Profile data updated',
                ], 200);
            }

            $kyc = Kyc::where('user_id', $user->id)->latest()->pluck('status')->first();
            if ($kyc) {
                $kycStatus = $kyc;
            } else {
                $kycStatus = 'Not applied';
            }
            $user->kyc_status = $kycStatus;
            $user->referral_point = systemflag('referralPoint');
            $user->payment_mode = systemflag('paymentMode');
            $user->notification_count = UserNotification::where('user_id', $user->id)->where('is_read', 0)->count();

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Profile data fetched'
            ], 200);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function deleteAccount(Request $request)
    {
        try {
            $user =  Auth::guard('api')->user()->delete();
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Account Deleted Successfully!',
            ], 200);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
