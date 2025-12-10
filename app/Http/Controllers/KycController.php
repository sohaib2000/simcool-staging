<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kyc;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class KycController extends BaseController
{
    public function index()
    {
        try {
            $kyc = Auth::user()->kycs()->latest()->first();
            return $this->sendResponse($kyc, 'KYC data fetched');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }

    // POST /api/kyc
    public function store(Request $request)
    {
        $request->validate([
            'full_name'         => 'required|string|max:255',
            'dob'               => 'required|date',
            'address'           => 'required|string',
            'identity_card_no'  => 'required',
            'identity_card'     => 'required|file|mimes:jpg,png,pdf|max:2048',
            'pancard'           => 'required|file|mimes:jpg,png,pdf|max:2048',
            'photo'             => 'required|file|mimes:jpg,png|max:2048',
        ]);

        try {
            // Helper function for file storage
            $storeFile = function ($file, $folder) {
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
                    . '_' . time() . '.' . $file->getClientOriginalExtension();
                return 'storage/' . $file->storeAs($folder, $filename, 'public');
            };

            $identityCardPath = $storeFile($request->file('identity_card'), 'images/users/kyc_docs');
            $pancardPath      = $storeFile($request->file('pancard'), 'images/users/kyc_docs');
            $photoPath        = $storeFile($request->file('photo'), 'images/users/kyc_photos');

            // Prevent duplicate pending/approved submissions
            $checkKyc = Kyc::where('user_id', Auth::id())
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            if ($checkKyc) {
                return $this->sendError('Already submitted KYC!');
            }

            $kyc = Kyc::create([
                'user_id'           => Auth::id(),
                'full_name'         => $request->full_name,
                'dob'               => $request->dob,
                'address'           => $request->address,
                'identity_card_no'  => $request->identity_card_no,
                'identity_card'     => $identityCardPath,
                'pancard'           => $pancardPath,
                'photo'             => $photoPath,
                'status'            => 'pending',
            ]);

            return $this->sendResponse($kyc, 'KYC submitted', 201);
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }


    public function update(Request $request, $id)
    {
        try {
            $kyc = Kyc::where('user_id', Auth::id())->findOrFail($id);

            $request->validate([
                'full_name'         => 'sometimes|string|max:255',
                'dob'               => 'sometimes|date',
                'address'           => 'sometimes|string',
                'identity_card_no'  => 'sometimes',
                'identity_card'     => 'sometimes|file|mimes:jpg,png,pdf|max:2048',
                'pancard'           => 'sometimes|file|mimes:jpg,png,pdf|max:2048',
                'photo'             => 'sometimes|file|mimes:jpg,png|max:2048',
            ]);

            // Helper for storing files with clean names
            $storeFile = function ($file, $folder) {
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
                    . '_' . time() . '.' . $file->getClientOriginalExtension();
                return 'storage/' . $file->storeAs($folder, $filename, 'public');
            };

            if ($request->hasFile('identity_card')) {
                $kyc->identity_card = $storeFile($request->file('identity_card'), 'images/users/kyc_docs');
            }

            if ($request->hasFile('pancard')) {
                $kyc->pancard = $storeFile($request->file('pancard'), 'images/users/kyc_docs');
            }

            if ($request->hasFile('photo')) {
                $kyc->photo = $storeFile($request->file('photo'), 'images/users/kyc_photos');
            }

            // Fill only the updatable fields
            $kyc->fill($request->only(['full_name', 'dob', 'address', 'identity_card_no']));

            // Reset status to pending after update
            $kyc->status = 'pending';

            $kyc->save();

            return $this->sendResponse($kyc, 'KYC updated successfully');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }


    public function status()
    {
        try {
            $kyc = Auth::user()->kycs()->latest()->first();
            return $this->sendResponse($kyc ? $kyc->status : null, 'Status fetched');
        } catch (\Throwable $th) {
            return $this->sendError($th->getMessage());
        }
    }
}
