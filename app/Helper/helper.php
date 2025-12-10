<?php

use App\Models\EmailTemplate;
use App\Models\EsimPackage;
use App\Models\Systemflag;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Currency;


if (!function_exists('systemflag')) {
    function systemflag($flagName)
    {
        $systemflag = Systemflag::where('name', @$flagName)->pluck('value')->first();
        if (@$systemflag) {
            return $systemflag;
        }
        return false;
    }
}
if (!function_exists('emailTemplate')) {
    function emailTemplate($tempName)
    {
        $tempData = EmailTemplate::where('name', @$tempName)->first();
        if (@$tempData) {
            return $tempData;
        }
        return false;
    }
}
if (!function_exists('packagePrice')) {
    function packagePrice($packageid, $currency)
    {
        $adminInclude = (float)(systemflag('PackageCommission') ?? 0);
        $packagePrices = EsimPackage::where('id', $packageid)
            ->select('id', 'net_price')
            ->first();

        $conversionRate = (float)(Currency::where('name', $currency)->value('usd_conversion') ?? 1);

        if (!$packagePrices || $packagePrices->net_price === null) {
            return false;
        }

        $providerPrice = (float)$packagePrices->net_price * $conversionRate;

        if ($adminInclude == 0) {
            return [
                'totalAmount' => $providerPrice,
                'providerPrice' => $providerPrice
            ];
        }

        $includePrice = ($providerPrice * $adminInclude) / 100;
        $netPrice = $includePrice + $providerPrice;

        // if ($currency == 'INR') {
        //     $netPrice = round($netPrice);
        // }

        return [
            'totalAmount' => $netPrice,
            'providerPrice' => $providerPrice
        ];
    }
}

if (!function_exists('updateIfChanged')) {
    /**
     * Update model only if attributes changed.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param array $attrs
     * @return bool True if model was updated
     */
    function updateIfChanged($model, array $attrs): bool
    {
        $dirty = false;

        foreach ($attrs as $key => $value) {
            if ($model->$key != $value) {
                $model->$key = $value;
                $dirty = true;
            }
        }

        if ($dirty) {
            $model->save();
        }

        return $dirty;
    }
}
