<?php

namespace App\Jobs;

use App\Mail\AllMail;
use App\Models\Country;
use App\Models\EmailTemplate;
use App\Models\UserEsim;
use App\Models\EsimOrder;
use App\Models\UserNotification;
use App\Notifications\EsimReadyToUseNoti;
use App\Notifications\OrderPlacedNoti;
use App\Services\AiraloService;
use App\Services\EsimAccessService;
use App\Services\EsimGoService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderStoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;
    protected $AiraloPackageId;
    protected $user;

    /**
     * Create a new job instance.
     */
    public function __construct($orderId, $AiraloPackageId, $user)
    {
        $this->orderId = $orderId;
        $this->AiraloPackageId = $AiraloPackageId;
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $updateOrder = EsimOrder::find($this->orderId);
        try {
            $esimProvider = '';
            if ($updateOrder->package->esim_provider == 'esimaccess') {
                $esimaccess = new EsimAccessService();
                $activation = $esimaccess->placeOrder($updateOrder->order_ref, $updateOrder->package->package_id);
                $esimProvider  = 'esimaccess';
            } else if ($updateOrder->package->esim_provider == 'esimgo') {
                $esimgo = new EsimGoService();
                $activation = $esimgo->placeOrder($updateOrder->package->package_id);
                $esimProvider  = 'esimgo';
            } else {
                $airalo = new AiraloService();
                $activation = $airalo->placeOrder(
                    $this->AiraloPackageId,
                    [
                        'name'     => $this->user->name ?? '',
                        'email'    => $this->user->email ?? '',
                        'quantity' => 1
                    ]
                );

                $esimProvider  = 'airalo';
            }
            if ($activation) {
                $updateOrder->status = 'completed';
                $updateOrder->activation_details = $activation;
                $updateOrder->save();
                $orderEsimReady = false;
                if ($esimProvider == 'esimaccess') {
                    UpdateUserEsimActivation::dispatch($updateOrder);
                } elseif ($esimProvider == 'esimgo') {
                    $esim = UserEsim::create([
                        'user_id' => $this->user->id,
                        'order_id' => $updateOrder->id,
                        'package_id' => $updateOrder->esim_package_id,
                        'iccid' => $activation->order[0]->esims[0]->iccid ?? null,
                        'imsis' => null,
                        'matching_id' => $activation->order[0]->esims[0]->matchingId,
                        'qrcode' => null,
                        'qrcode_url' => $activation->order[0]->esims[0]->smdpAddress,
                        'airalo_code' => null,
                        'apn_type' => null,
                        'apn_value' => null,
                        'is_roaming' => null,
                        'confirmation_code' => null,
                        'apn' => null,
                        'status' => 'NOT_ACTIVE',
                        'direct_apple_installation_url' => null,
                    ]);
                    $esim->user->notify(new EsimReadyToUseNoti($esim['iccid']));
                    $orderEsimReady = true;
                } else {
                    if ($activation['meta']['message'] == 'success') {

                        foreach ($activation['data']['sims'] as $esim) {
                            $esim = UserEsim::create([
                                'user_id' => $this->user->id,
                                'order_id' => $updateOrder->id,
                                'package_id' => $updateOrder->esim_package_id,
                                'iccid' => $esim['iccid'] ?? null,
                                'imsis' => $esim['imsis'] ?? null,
                                'matching_id' => $esim['matching_id'] ?? null,
                                'qrcode' => $esim['qrcode'] ?? null,
                                'qrcode_url' => $esim['qrcode_url'] ?? null,
                                'airalo_code' => $esim['airalo_code'] ?? null,
                                'apn_type' => $esim['apn_type'] ?? null,
                                'apn_value' => $esim['apn_value'] ?? null,
                                'is_roaming' => $esim['is_roaming'] ?? null,
                                'confirmation_code' => $esim['confirmation_code'] ?? null,
                                'apn' => $esim['apn'] ?? null,
                                'direct_apple_installation_url' => $esim['direct_apple_installation_url'] ?? null,
                            ]);
                            $esim->user->notify(new EsimReadyToUseNoti($esim['iccid']));
                            $orderEsimReady = true;
                        }
                    } else {
                        $updateOrder->status = 'failed';
                        $updateOrder->activation_details = $activation['data'];
                    }
                }
                if ($orderEsimReady) {
                    $orderTemp = emailTemplate('activation');
                    $companyName = systemflag('appName');
                    $template = $orderTemp->description;
                    $tempSubject = $orderTemp->subject;
                    $locations = Country::whereIn('id', $updateOrder->package->country_ids)->pluck('name');

                    $data = [
                        'qrCode' =>  $updateOrder->order_ref,
                        'packageName' =>  $updateOrder->package->name,
                        'location' =>  implode(',', $locations),
                        'iccid' =>  $updateOrder->esims->iccid ?? '',
                        'activationUrl' =>  $updateOrder->esims->qrcode ?? '',
                        'companyName' => $companyName,
                        'date' => date('Y')
                    ];

                    Mail::to($updateOrder->user->email)->send(new AllMail($template, $data, $tempSubject));
                }
            }
        } catch (\Throwable $e) {
            $updateOrder->status = 'failed';
            $updateOrder->activation_details = $e->getMessage();
            Log::error('OrderStoreJob Failed: ' . $e->getMessage(), [
                'order_id' => $this->orderId ?? null,
                'user_id' => $this->user->id ?? null
            ]);
        }
    }
}
