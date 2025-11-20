<?php

namespace App\Jobs;

use App\Models\UserEsim;
use App\Notifications\LowDataNoti;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class LowDataJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        UserEsim::where('status', 'ACTIVE')
            ->chunk(100, function ($esims) {
                foreach ($esims as $esim) {
                    $esim->user->notify(new LowDataNoti($esim->package->name,$esim->expired_at));
                }
            });
    }
}
