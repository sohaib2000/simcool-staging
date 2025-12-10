<?php

namespace App\Http\Controllers;

use Airalo\Airalo;
use App\Http\Resources\GetUsageResource;
use App\Models\UserEsim;
use App\Models\UserNotification;
use App\Services\AiraloService;
use App\Services\EsimAccessService;
use Illuminate\Http\Request;
use Auth;

class HomeController extends BaseController
{
    public function getUsage(Request $request, AiraloService $airalo, EsimAccessService $esimacess)
    {
        try {
            $mysims = Auth::guard('api')->user()->esims;
            $data = [];
            foreach ($mysims as $sim) {
                if ($sim->package->esim_provider == 'esimaccess') {
                    $response = $esimacess->getUsage($sim->order->activation_details['transactionId']);
                    $data[] = [
                        'id' => $sim->id,
                        'iccid'  => $sim->iccid,
                        'esim_status' => $sim->status,
                        'location' => '',
                        'usage'  => $response ?? null
                    ];
                } elseif ($sim->package->esim_provider == 'esimgo') {
                } else {
                    if ($sim->status == 'ACTIVE') {
                        $response = $airalo->getUsage($sim->iccid);
                        if ($sim->package->operator->type == 'local') {
                            $location = $sim->package->operator->country;
                        } else {
                            $location = $sim->package->operator->region;
                        }
                        $data[] = [
                            'id' => $sim->id,
                            'iccid'  => $sim->iccid,
                            'esim_status' => $sim->status,
                            'location' => $location,
                            'usage'  => $response['data'] ?? null
                        ];
                    }
                }
            }

            return $this->sendResponse($data, 'Data retrieved successfully!');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function notifications(Request $request)
    {
        try {
            $userId = Auth::guard('api')->user()->id;
            if ($request->is_read) {
                UserNotification::where('user_id', $userId)->update(['is_read' => 1]);
            }
            if ($request->is_read && $request->notification_id) {
                UserNotification::where('id', $request->notification_id)->update(['is_read' => 1]);
            }
            $perPage = $request->input('per_page', 10);
            $notifications = UserNotification::where('user_id', $userId)->orderBy('id', 'desc')->paginate($perPage);
            return $this->sendResponse($notifications, 'Data retrieved successfully!');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
    public function esimInstruction(Request $request, AiraloService $airalo)
    {
        try {
            $user = Auth::guard('api')->user();

            if (!$user->esims->where('iccid', $request->iccid)) {
                return $this->sendError('Iccid id invalid');
            }
            $esim = UserEsim::where('iccid', $request->iccid)->first();
            $request->validate([
                'iccid' => 'required|numeric|exists:user_esims,iccid',
            ]);

            $activationCode = $esim->airalo_code;
            $smdpAddress = '';
            $apnValue = $esim->apn_value;

            $qrCodeData = $esim->qrcode;
            $qrCodeUrl = $esim->qrcode_url;
            $directAppleInstalationUrl = $esim->direct_apple_installation_url;


            // === Full JSON structure ===
            $data = [
                "instructions" => [
                    "language" => "EN",
                    "ios" => [
                        [
                            "model" => null,
                            "version" => "15.0,14.0,13.0,12.0",
                            "direct_apple_installation_url" => $directAppleInstalationUrl,
                            "installation_via_qr_code" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Cellular/Mobile Data”, then tap “Add Cellular/Data Plan” on your device.",
                                    "2" => "Scan the QR code available on the app, then tap “Add Cellular/Data Plan”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "qr_code_data" => $qrCodeData,
                                "qr_code_url" => $qrCodeUrl,
                            ],
                            "installation_manual" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Cellular/Mobile Data”, then tap “Add Cellular/Data Plan” on your device.",
                                    "2" => "Tap “Enter Details Manually” and enter the SM-DP+ Address and Activation Code available on the app by copying them, tap “Next”, then tap “Add Cellular/Data Plan”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "smdp_address_and_activation_code" => $qrCodeData,
                                "smdp_address" => $smdpAddress,
                                "activation_code" => $activationCode
                            ],
                            "network_setup" => [
                                "steps" => [
                                    "1" => "Go to “Cellular/Mobile Data”, then select the recently downloaded eSIM on your device. Enable the “Turn On This Line” toggle, then select your new eSIM plan for cellular/mobile data.",
                                    "2" => "Tap “Network Selection”, disable the “Automatic” toggle, then select the supported network available on the app manually if your eSIM has connected to the wrong network.",
                                    "3" => "Tap “Cellular/Mobile Data Network”, then enter the APN available on the app in all APN fields by copying it.",
                                    "4" => "Enable the “Data Roaming” toggle for your new eSIM plan."
                                ],
                                "apn_type" => "automatic",
                                "apn_value" => $apnValue,
                                "is_roaming" => true
                            ]
                        ],
                        [
                            "model" => null,
                            "version" => "16.0",
                            "direct_apple_installation_url" => $directAppleInstalationUrl,
                            "installation_via_qr_code" => [
                                "steps" => [
                                    "1" => "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device.",
                                    "2" => "Scan the QR code available on the app, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "qr_code_data" => $qrCodeData,
                                "qr_code_url" => $qrCodeUrl
                            ],
                            "installation_manual" => [
                                "steps" => [
                                    "1" => "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device.",
                                    "2" => "Tap “Enter Details Manually” and enter the SM-DP+ Address and Activation Code available on the app by copying them, tap “Next”, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "smdp_address_and_activation_code" => $qrCodeData,
                                "smdp_address" => $smdpAddress,
                                "activation_code" => $activationCode
                            ],
                            "network_setup" => [
                                "steps" => [
                                    "1" => "Go to “Cellular/Mobile Data”, then select the recently downloaded eSIM on your device. Enable the “Turn On This Line” toggle, then select your new eSIM plan for cellular/mobile data.",
                                    "2" => "Tap “Network Selection”, disable the “Automatic” toggle, then select the supported network available on the app manually if your eSIM has connected to the wrong network.",
                                    "3" => "Tap “Cellular/Mobile Data Network”, then enter the APN available on the app in all APN fields by copying it.",
                                    "4" => "Enable the “Data Roaming” toggle for your new eSIM plan."
                                ],
                                "apn_type" => "automatic",
                                "apn_value" => $apnValue,
                                "is_roaming" => true
                            ]
                        ],
                        [
                            "model" => null,
                            "version" => null,
                            "direct_apple_installation_url" => $directAppleInstalationUrl,
                            "installation_via_qr_code" => [
                                "steps" => [
                                    "1" => "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device.",
                                    "2" => "Scan the QR code or take a screenshot, tap “Open Photos”, select it from your camera roll, tap “Next”, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "qr_code_data" => $qrCodeData,
                                "qr_code_url" => $qrCodeUrl
                            ],
                            "installation_manual" => [
                                "steps" => [
                                    "1" => "Go to Settings > Cellular/Mobile Data > Add eSIM or Set up Cellular/Mobile Service > Use QR Code on your device.",
                                    "2" => "Tap “Enter Details Manually” and enter the SM-DP+ Address and Activation Code available on the app by copying them, tap “Next”, then tap “Continue” twice and wait for a while. Your eSIM will connect to the network, this may take a few minutes, then tap “Done”.",
                                    "3" => "Choose a label for your new eSIM plan.",
                                    "4" => "Choose “Primary” for your default line, then tap “Continue”.",
                                    "5" => "Choose the “Primary” you want to use with iMessage and FaceTime for your Apple ID, then tap “Continue”.",
                                    "6" => "Choose your new eSIM plan for cellular/mobile data, then tap “Continue”."
                                ],
                                "smdp_address_and_activation_code" => $qrCodeData,
                                "smdp_address" => $smdpAddress,
                                "activation_code" => $activationCode
                            ],
                            "network_setup" => [
                                "steps" => [
                                    "1" => "Go to “Cellular/Mobile Data”, then select the recently downloaded eSIM on your device. Enable the “Turn On This Line” toggle, then select your new eSIM plan for cellular/mobile data.",
                                    "2" => "Tap “Network Selection”, disable the “Automatic” toggle, then select the supported network available on the app manually if your eSIM has connected to the wrong network.",
                                    "3" => "Tap “Cellular/Mobile Data Network”, then enter the APN available on the app in all APN fields by copying it.",
                                    "4" => "Enable the “Data Roaming” toggle for your new eSIM plan."
                                ],
                                "apn_type" => "automatic",
                                "apn_value" => $apnValue,
                                "is_roaming" => true
                            ]
                        ]
                    ],
                    "android" => [
                        [
                            "model" => null,
                            "version" => null,
                            "installation_via_qr_code" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Connections”, then tap “SIM card manager” on your device.",
                                    "2" => "Tap “Add mobile plan”, then tap “Scan carrier QR code”.",
                                    "3" => "Scan the QR code available on the app, then tap “Confirm”."
                                ],
                                "qr_code_data" => $qrCodeData,
                                "qr_code_url" => $qrCodeUrl
                            ],
                            "installation_manual" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Connections”, then tap “SIM card manager” on your device.",
                                    "2" => "Tap “Add mobile plan”, then tap “Scan carrier QR code”.",
                                    "3" => "Tap “Enter activation code”.",
                                    "4" => "Enter the SM-DP+ Address & Activation Code available on the app by copying it, tap “Connect”, then tap “Confirm”."
                                ],
                                "smdp_address_and_activation_code" => $qrCodeData
                            ],
                            "network_setup" => [
                                "steps" => [
                                    "1" => "Go to “SIM card manager”, then turn on your eSIM by enabling the toggle, then tap “OK” on your device.",
                                    "2" => "Select your eSIM for mobile data.",
                                    "3" => "Go to “Connections”, then tap “Mobile networks”.",
                                    "4" => "Enable the “Data roaming” toggle.",
                                    "5" => "Tap “Access Point Names”, then tap “Add” on the right top of the screen.",
                                    "6" => "Enter the APN available on the app by copying it into the Name and APN fields.",
                                    "7" => "Tap the three dots on the right top of the screen, tap “Save”, then select the APN you have saved by clicking the radio button.",
                                    "8" => "Tap “Network operators”, tap the “Select automatically” toggle then choose the supported network available on the app manually if your eSIM has connected to the wrong network."
                                ],
                                "apn_type" => "manual",
                                "apn_value" => $apnValue,
                                "is_roaming" => true
                            ]
                        ],
                        [
                            "model" => null,
                            "version" => null,
                            "installation_via_qr_code" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Network & internet”, then tap “(+)” next to the SIMs section, if it’s not available tap “SIMs/Mobile network” on your device.",
                                    "2" => "Tap “Download a SIM instead?”, then tap “Next”.",
                                    "3" => "Tap “Use a different network” if you need to confirm your network.",
                                    "4" => "Scan the QR code available on the app, then tap “Download/Activate”.",
                                    "5" => "Tap “Settings/Done” when you see the Download Finished screen."
                                ],
                                "qr_code_data" => $qrCodeData,
                                "qr_code_url" => $qrCodeUrl
                            ],
                            "installation_manual" => [
                                "steps" => [
                                    "1" => "Go to “Settings”, tap “Network & internet”, then tap “(+)” next to the SIMs section, if it’s not available tap “SIMs/Mobile network” on your device.",
                                    "2" => "Tap “Download a SIM instead?”, then tap “Next”.",
                                    "3" => "Tap “Use a different network” if you need to confirm your network.",
                                    "4" => "Tap “Need help?”, then tap “Enter it manually”.",
                                    "5" => "Enter the SM-DP+ Address & Activation Code available on the app by copying it, tap “Continue”, then tap “Download/Activate”.",
                                    "6" => "Tap “Settings/Done” when you see the Download Finished screen."
                                ],
                                "smdp_address_and_activation_code" => $qrCodeData,
                                "smdp_address" => $smdpAddress,
                                "activation_code" => $activationCode
                            ],
                            "network_setup" => [
                                "steps" => [
                                    "1" => "Go to “SIMs”, then select the recently downloaded eSIM on your device.",
                                    "2" => "Enable the “Use SIM” toggle, then tap “Yes”.",
                                    "3" => "Enable the “Mobile data” toggle.",
                                    "4" => "Enable the “Roaming” toggle, then tap “OK”.",
                                    "5" => "Tap the “Automatically select network” toggle then choose the supported network available on the app manually if your eSIM has connected to the wrong network.",
                                    "6" => "Tap “Access Point Names”, then tap “(+)”.",
                                    "7" => "Enter the APN available on the app by copying it into the Name and APN fields.",
                                    "8" => "Tap the three dots on the right top of the screen, tap “Save”, then select the APN you have saved by clicking the radio button."
                                ],
                                "apn_type" => "manual",
                                "apn_value" => $apnValue,
                                "is_roaming" => true
                            ]
                        ]
                    ]
                ]
            ];

            $iccid = $request->iccid;
            if ($esim->package->esim_provider == 'airalo') {
                $response = $airalo->instructions($iccid);
                $data = $response['data'];
            }
            return $this->sendResponse($data, 'Instruction retrieved successfully!');
        } catch (\Exception $th) {
            return $this->sendError($th->getMessage());
        }
    }
}
