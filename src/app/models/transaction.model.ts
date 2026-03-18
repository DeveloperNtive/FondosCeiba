export interface Transaction {
  id: number;
  fundId: number;
  type: 'SUBSCRIPTION' | 'CANCEL';
  amount: number;
  date: Date;
  notificationMethod?: 'EMAIL' | 'SMS';
}