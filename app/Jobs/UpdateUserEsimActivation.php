<?php

namespace App\Jobs;

use App\Mail\AllMail;
use App\Models\Country;
use App\Models\UserEsim;
use App\Models\UserNotification;
use App\Notifications\ActivatedSimNoti;
use App\Notifications\EsimReadyToUseNoti;
use App\Services\AiraloService;
use App\Services\EsimAccessService;
use App\Services\EsimGoService;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class UpdateUserEsimActivation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;

    /**
     * Create a new job instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(
        AiraloService $airaloService,
        EsimAccessService $esimAccess,
        EsimGoService $esimGo
    ) {
        try {
            if (!$this->order) {
                Log::warning('UpdateUserEsimActivation called without order instance');
                return;
            }

            // Always ensure $esim model exists
            $esim = UserEsim::firstOrNew(['order_id' => $this->order->id]);

            $provider = $this->order->package->esim_provider;
            $data = null;

            /**
             * -------------------------------------------------------
             * ESIM ACCESS PROVIDER
             * -------------------------------------------------------
             */
            if ($provider === 'esimaccess') {

                $orderNo = data_get($this->order->activation_details, 'orderNo');
                if (!$orderNo) {
                    Log::warning("Missing orderNo for esimaccess order: {$this->order->id}");
                    return;
                }

                $data = $esimAccess->getEsimDetails($orderNo);
                if (empty($data[0])) {
                    Log::warning("No data returned for esimaccess order: {$this->order->id}");
                    return;
                }

                $details = $data[0];
                $esimAttrs = [
                    'user_id' => $this->order->user_id,
                    'order_id' => $this->order->id,
                    'package_id' => $this->order->esim_package_id,
                    'iccid' => $details->iccid ?? null,
                    'imsis' => $details->imsi ?? null,
                    'matching_id' => null,
                    'qrcode' => $details->ac ?? null,
                    'qrcode_url' => $details->qrCodeUrl ?? null,
                    'airalo_code' => $details->pin ?? null,
                    'apn_type' => null,
                    'is_roaming' => 0,
                    'apn_value' => $details->apn ?? null,
                    'confirmation_code' => null,
                    'apn' => $details->apn ?? null,
                    'activated_at' => $details->activateTime ?? null,
                    'expired_at' => $details->expiredTime ?? null,
                    'status' => $details->esimStatus === 'GOT_RESOURCE'
                        ? 'NOT_ACTIVE'
                        : $details->esimStatus,
                    'direct_apple_installation_url' => $details->shortUrl ?? null,
                ];

                // Update if already exists, else create
                if ($esim->exists) {
                    if (updateIfChanged($esim, $esimAttrs)) {
                        Log::info("Esim Access updated ICCID: {$esim->iccid}");
                    }
                } else {
                    $esim->fill($esimAttrs)->save();
                    Log::info("Esim Access created ICCID: {$esim->iccid}");

                    // Notify user: esim ready
                    $esim->user?->notify(new EsimReadyToUseNoti($esim->iccid));

                    // Prepare activation email
                    $orderTemp = emailTemplate('activation');
                    if ($orderTemp) {
                        $companyName = systemflag('appName');
                        $template = $orderTemp->description;
                        $tempSubject = $orderTemp->subject;
                        $countryIds = explode(',',$this->order->package->country_ids);
                        $locations = Country::whereIn('id', $countryIds)->pluck('name');

                        $esimData = $esim; // Use newly created esim

                        $Emaildata = [
                            'qrCode' => $this->order->order_ref,
                            'packageName' => $this->order->package->name,
                            'location' => implode(',', $locations->toArray()),
                            'iccid' => $esimData->iccid ?? '',
                            'activationUrl' => $esimData->qrcode ?? '',
                            'companyName' => $companyName,
                            'date' => date('Y'),
                        ];

                        // Optional: send activation email
                         Mail::to($this->order->user->email)->send(new AllMail($template, $Emaildata, $tempSubject));
                    }
                }

                // Handle activation notification
                if (!empty($data) && isset($details->smdpStatus) && $details->smdpStatus === 'ENABLED') {
                    if (!$esim->activation_notified) {
                        DB::transaction(function () use ($esim) {
                            $esim->activation_notified = true;
                            $esim->save();

                            $esim->user?->notify(new ActivatedSimNoti($esim));

                            UserNotification::create([
                                'user_id'    => $esim->user_id,
                                'title'      => 'Esim Activated!',
                                'type'       => 2,
                                'description' => 'Your ICCID ' . $esim->iccid . ' is now active!',
                            ]);
                        });
                    }
                }
            }

            /**
             * -------------------------------------------------------
             * ESIMGO PROVIDER
             * -------------------------------------------------------
             */
            elseif ($provider === 'esimgo') {

                $iccid = data_get($this->order->activation_details, 'order.0.esims.0.iccid');
                if (!$iccid) {
                    Log::warning("Missing ICCID for esimgo order: {$this->order->id}");
                    return;
                }

                $data = $esimGo->getEsimDetails($iccid);
                if (!$data) {
                    Log::warning("No data returned for esimgo ICCID: {$iccid}");
                    return;
                }

                $esim->update([
                    'iccid'        => $data->iccid ?? null,
                    'status'       => $data->profileStatus ?? null,
                    'activated_at' => $data->firstInstalledDateTime ?? null,
                    'direct_apple_installation_url' => $data->appleInstallUrl ?? null,
                    'confirmation_code' => $data->pin ?? null,
                ]);

                if (!$esim->activation_notified && !empty($data->firstInstalledDateTime)) {
                    DB::transaction(function () use ($esim) {
                        $esim->activation_notified = true;
                        $esim->save();

                        $esim->user?->notify(new ActivatedSimNoti($esim));

                        UserNotification::create([
                            'user_id'    => $esim->user_id,
                            'title'      => 'Esim Activated!',
                            'type'       => 2,
                            'description' => 'Your ICCID ' . $esim->iccid . ' is now active!',
                        ]);
                    });
                }
            }

            /**
             * -------------------------------------------------------
             * AIRALO PROVIDER
             * -------------------------------------------------------
             */
            else {
                if (!$esim->iccid) {
                    Log::warning("Missing ICCID for airalo order: {$this->order->id}");
                    return;
                }

                $data = $airaloService->getEsimDetails($esim->iccid);

                if (!empty($data['data'])) {
                    foreach ($data['data'] as $response) {
                        $esim->update([
                            'status'       => $response['status'] ?? null,
                            'activated_at' => $response['activated_at'] ?? null,
                            'expired_at'   => $response['expired_at'] ?? null,
                            'finished_at'  => $response['finished_at'] ?? null,
                        ]);

                        if (!$esim->activation_notified && ($response['status'] ?? null) === 'ACTIVE') {
                            DB::transaction(function () use ($esim) {
                                $esim->activation_notified = true;
                                $esim->save();

                                $esim->user?->notify(new ActivatedSimNoti($esim));

                                UserNotification::create([
                                    'user_id'    => $esim->user_id,
                                    'title'      => 'Esim Activated!',
                                    'type'       => 2,
                                    'description' => 'Your ICCID ' . $esim->iccid . ' is now active!',
                                ]);
                            });
                        }
                    }
                } else {
                    $orderCode = data_get($this->order->activation_details, 'id');
                    if ($orderCode) {
                        $statusData = $airaloService->getOrderStatus($orderCode);
                        $esim->status = data_get($statusData, 'data.status.name', $esim->status);
                        $esim->save();
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('UpdateUserEsimActivation failed', [
                'error' => $e->getMessage(),
                'order_id' => $this->order->id ?? null,
                'user_esim_id' => $esim->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
