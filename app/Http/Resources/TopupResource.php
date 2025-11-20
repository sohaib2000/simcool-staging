<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\InAppProduct;

class TopupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $adminIncludeTopup = systemflag('TopUpCommission');
        $netPrice = $this['net_price'] ?? 0;
        $includePrice = $netPrice * $adminIncludeTopup / 100;
        $netPriceWithTopup = $includePrice + $netPrice;
        
         if($request->fromApp != null){
            if($request->fromApp == 'android' || $request->fromApp == 'ios'){
               $netPriceWithTopup = InAppProduct::where('min_price', '<=', $netPriceWithTopup)->where('max_price', '>=', $netPriceWithTopup)->pluck('max_price')->first();
            }
        }

        return [
            "id" => $this['id'],
            "type" => $this['type'],
            "day" => $this['day'],
            "is_unlimited" => $this['is_unlimited'],
            "title" => $this['title'],
            "data" => $this['data'],
            "short_info" => $this['short_info'],
            "voice" => $this['voice'] ?? 0,
            "text" => $this['text'] ?? 0,
            "net_price" => $netPriceWithTopup,
        ];
    }
}
