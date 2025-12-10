<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('esimgo:sync-packages')
    ->hourly()
    ->when(fn() => systemflag('esimProvider') == 'esimgo');

Schedule::command('esimaccess:sync-packages')
    ->hourly()
    ->when(fn() => systemflag('esimProvider') == 'esimaccess');

Schedule::command('esimaccess:sync-global-packages')
    ->hourly()
    ->when(fn() => systemflag('esimProvider') == 'esimaccess');

Schedule::command('airalo:sync-packages')
    ->hourly()
    ->when(fn() => systemflag('esimProvider') == 'airalo');

Schedule::command('airalo:sync-global-package')
    ->hourly()
    ->when(fn() => systemflag('esimProvider') == 'airalo');

Schedule::command('app:update-esim-activation-command')->everyFiveMinutes();
Schedule::command('app:update-order-status-command')->everyMinute();

