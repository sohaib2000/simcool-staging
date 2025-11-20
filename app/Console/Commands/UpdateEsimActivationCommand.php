<?php

namespace App\Console\Commands;

use App\Jobs\UpdateOrderStatus;
use App\Jobs\UpdateUserEsimActivation;
use App\Models\EsimOrder;
use App\Models\UserEsim;
use Illuminate\Console\Command;
use Carbon\Carbon;

class UpdateEsimActivationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-esim-activation-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Esim Activation Status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        EsimOrder::whereIn('status',['completed'])
            ->chunk(20, function ($orders) {
                foreach ($orders as $order) {
                    UpdateUserEsimActivation::dispatch($order);
                }
        });

    }
}
