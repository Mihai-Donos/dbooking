<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoicePosition extends Model
{
    /** @use HasFactory<\Database\Factories\InvoicePositionFactory> */
    use HasFactory;

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }


}
