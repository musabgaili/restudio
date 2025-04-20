<?php

namespace App\Enums\Sales\Payemnt;

enum PayemntType: string
{
    case DownPayment = 'down_payment';
    case Installment = 'installment';
}
