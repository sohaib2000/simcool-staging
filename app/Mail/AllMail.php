<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AllMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $template;
    protected $data;
    protected $tempSubject;

    public function __construct($template, array $data, $tempSubject)
    {
        $this->template = $template;
        $this->data = $data;
        $this->tempSubject = $tempSubject;
    }

    public function build()
    {
        $content = $this->template;

        foreach ($this->data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }

        return $this->subject($this->tempSubject)
            ->html($content);
    }
}
