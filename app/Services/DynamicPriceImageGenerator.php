<?php

namespace App\Services;

use Intervention\Image\Facades\Image;

use Illuminate\Support\Facades\Storage;

class DynamicPriceImageGenerator
{
    /**
     * Generate an image with dynamic price
     *
     * @param string $templatePath Path to the base template image
     * @param float $price The price to display
     * @param string $productName The product name (optional)
     * @return string Path to the generated image
     */
    public function generatePriceImage($templatePath, $price, $productName = null)
    {
        // Load the base template image
        $img = Image::make($templatePath);

        // Get image dimensions
        $width = $img->width();
        $height = $img->height();

        // Define coordinates where price should be placed
        // Based on your screenshot, the price "₹ 149" appears around x:69, y:1113
        $priceX = 69;
        $priceY = 1113;

        // Clear the old price area (draw a rectangle to cover old text)
        // Adjust these coordinates based on your exact image
        $img->rectangle($priceX - 5, $priceY - 50, $priceX + 200, $priceY + 20, function ($draw) {
            $draw->background('rgba(51, 51, 51, 1)'); // Match the dark background
        });

        // Format the price
        $formattedPrice = "₹ " . number_format($price, 0);

        // Add the new price text
        $img->text($formattedPrice, $priceX, $priceY, function ($font) {
            $font->file(public_path('fonts/Roboto-Bold.ttf')); // Use appropriate font
            $font->size(48); // Adjust size to match original
            $font->color('#FFFFFF');
            $font->align('left');
            $font->valign('top');
        });

        // If product name needs updating (e.g., "eSIM Pack (₹149)")
        if ($productName) {
            $titleX = 191;
            $titleY = 953;

            // Clear old product name area
            $img->rectangle($titleX - 5, $titleY - 50, $titleX + 400, $titleY + 20, function ($draw) {
                $draw->background('rgba(51, 51, 51, 1)');
            });

            // Add new product name with price
            $productTitle = "{$productName} (₹{$price})";
            $img->text($productTitle, $titleX, $titleY, function ($font) {
                $font->file(public_path('fonts/Roboto-Medium.ttf'));
                $font->size(28);
                $font->color('#FFFFFF');
                $font->align('left');
                $font->valign('top');
            });
        }

        // Generate unique filename
        $filename = 'review_screenshots/iap_' . $price . '_' . time() . '.png';

        // Save to storage
        $img->save(storage_path('app/public/' . $filename));

        return $filename;
    }

    /**
     * Generate multiple images for different prices
     *
     * @param string $templatePath
     * @param array $prices
     * @return array Array of generated image paths
     */
    public function generateMultiplePriceImages($templatePath, array $prices)
    {
        $generatedImages = [];

        foreach ($prices as $price) {
            $generatedImages[$price] = $this->generatePriceImage($templatePath, $price);
        }

        return $generatedImages;
    }

    public function generatePriceImageWithGD($templatePath, $price, $sku)
    {
        // Load the image
        $img = imagecreatefrompng($templatePath);

        if (!$img) {
            throw new \Exception("Unable to load template image");
        }

        // Set up colors
        $textColor = imagecolorallocate($img, 255, 255, 255);
        $bgColor = imagecolorallocate($img, 51, 51, 51);

        // Path to TrueType font
        $fontPath = storage_path('fonts/Roboto-Bold.ttf');

        $parenthesesPriceX = 351;
        $parenthesesPriceY = 981;

        $parenthesesPrice = systemflag('iapDefaultCurrency') .' '. number_format($price, 0);

        imagefilledrectangle($img, $parenthesesPriceX - 15, $parenthesesPriceY - 25, $parenthesesPriceX + 100, $parenthesesPriceY + 15, $bgColor);
        imagettftext($img, 20, 0, $parenthesesPriceX, $parenthesesPriceY, $textColor, $fontPath, $parenthesesPrice);

        $mainPriceX = 75;
        $mainPriceY = 1143;

        $formattedPrice = systemflag('iapDefaultCurrency') .' '. number_format($price, 0);

        imagefilledrectangle($img, $mainPriceX - 10, $mainPriceY - 30, $mainPriceX + 150, $mainPriceY + 10, $bgColor);

        // Add main purchase price with larger font
        imagettftext($img, 25, 0, $mainPriceX, $mainPriceY, $textColor, $fontPath, $formattedPrice);

        // Generate filename
        $filename = 'review_screenshots/'. $sku . '.png';
        $fullPath = storage_path('app/public/' . $filename);

        // Ensure directory exists
        if (!is_dir(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Save image
        imagepng($img, $fullPath);
        imagedestroy($img);

        return $fullPath;
    }
}
