<?php

namespace App\Jobs;

use App\Models\EsimOrder;
use App\Models\TopupHistory;
use App\Models\UserEsim;
use App\Notifications\TopupNoti;
use App\Services\AiraloService;
use App\Services\EsimAccessService;
use App\Services\EsimGoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class TopupStoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $iccid;
    protected $topUpPackageId;
    protected $userId;
    protected $orderId;

    /**
     * Create a new job instance.
     */
    public function __construct($iccid, $topUpPackageId, $userId, $orderId)
    {
        $this->iccid = $iccid;
        $this->topUpPackageId = $topUpPackageId;
        $this->userId = $userId;
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
          $updateOrder = EsimOrder::find($this->orderId);
          $userEsim = UserEsim::where('iccid',$this->iccid)->first();
        try {
            if(systemflag('esimProvider') == 'esimgo')
            {
                $esimgo = new EsimGoService();
                $response = $esimgo->placeOrder($updateOrder->package->package_id,$this->iccid);
            } elseif(systemflag('esimProvider') == 'esimaccess'){
                $esimaccess = new EsimAccessService();
                $esimdetails = $esimaccess->getEsimDetails($userEsim->order->activation_details['orderNo']);
                $response = $esimaccess->storeTopUp($updateOrder->order_ref,$updateOrder->package->package_id,$esimdetails->esimTranNo);
            }
            else{
                $airalo = new AiraloService();
                $response = $airalo->storeTopUp($this->topUpPackageId, $this->iccid);
            }
            if ($response) {

                $updateOrder->status = 'completed';
                $updateOrder->activation_details = $response ?? null;

                TopupHistory::create([
                    'user_id' => $this->userId,
                    'order_id' => $updateOrder->id,
                    'topup_package_id' => $updateOrder->package->package_id,
                    'iccid' => $this->iccid ?? null,
                ]);
                 $updateOrder->user->notify(new TopupNoti($updateOrder->package));
            }else{
                $updateOrder->status = 'failed';
                $updateOrder->activation_details = $response ?? null;
            }
            $updateOrder->save();
        } catch (\Throwable $th) {
                  $updateOrder->status = 'failed';
                $updateOrder->activation_details = $th->getMessage();
            Log::error('TopUpStoreJob Failed: ' . $th->getMessage(), [
                'order_id' => $this->orderId ?? null,
                'user_id' => $this->userId ?? null
            ]);
        }
    }
}
