<?php

namespace App\Enums\Sales\Payemnt;

enum DepositType: string
{
    case Cheque = 'cheque';
    case BankTransfer = 'bank_transfer';
}
