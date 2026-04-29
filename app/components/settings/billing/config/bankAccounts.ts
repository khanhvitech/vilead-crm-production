export interface BankAccount {
  id: string;
  bankName: string;
  bankShortName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  // VietQR bank code
  vietQRBankId: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'mb_main',
    bankName: 'Ngân hàng Quân Đội',
    bankShortName: 'MB Bank',
    accountNumber: '0969090909090',
    accountHolder: 'CÔNG TY TNHH VILEAD',
    vietQRBankId: 'MB',
  },
  {
    id: 'vcb_main',
    bankName: 'Ngân hàng Vietcombank',
    bankShortName: 'Vietcombank',
    accountNumber: '1234567890',
    accountHolder: 'CÔNG TY TNHH VILEAD',
    vietQRBankId: 'VCB',
  },
];
