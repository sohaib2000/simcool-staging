<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Reverb Apps
    |--------------------------------------------------------------------------
    |
    | You may define the apps that are allowed to connect to your Reverb
    | server. Each app must have an id, key, and secret. These values
    | will be used to authenticate incoming requests to your server.
    |
    */

    'apps' => [
        [
            'id' => env('REVERB_APP_ID', 'app-1'),
            'name' => env('APP_NAME', 'ESIMTEL'),
            'key' => env('REVERB_APP_KEY', ''),
            'secret' => env('REVERB_APP_SECRET', ''),
            'capacity' => null, // Max concurrent connections (null = unlimited)
            'enable_client_messages' => false, // Allow client to send messages
            'enable_statistics' => true,       // Enable Reverb stats API
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb Server
    |--------------------------------------------------------------------------
    |
    | The server configuration options for your Reverb WebSocket server.
    | These values control the host, port, and protocol used when
    | clients connect to the WebSocket server from the frontend.
    |
    */

    'server' => [
        'host' => env('REVERB_HOST', '0.0.0.0'),
        'port' => env('REVERB_PORT', 8080),
        'scheme' => env('REVERB_SCHEME', 'http'), // or "https" if using SSL
    ],

];
