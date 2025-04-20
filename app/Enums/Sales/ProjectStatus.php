<?php

namespace App\Enums\Sales;

enum ProjectStatus: string
{
    case Available = 'available';
    case NotAvailable = 'n-a';
    case Sold = 'sold';


}
