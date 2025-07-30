export type TableSession = {
  id: number;
  table: any; 
  orders: any[];
  createdAt: Date;
  closedAt?: Date;

  //TODO: Change Any for Table/Order if they end up being used 
}
