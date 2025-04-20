<?php

namespace App\Enums\Sales;

enum BlockStatus: string
{
    case Available = 'available';
    case NotAvailable = 'n-a';
    case Sold = 'sold';
    case Booked = 'booked';
}
