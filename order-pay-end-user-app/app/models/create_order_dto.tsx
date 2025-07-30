export type CreateOrderDTO = {
  tableId: number;
  tableSessionId: number;
  restaurantId: number;
  products: {
    productId: number;
    quantity: number;
    productOptions?: {
      productOptionId: number;
      productOptionValues: number[];
    }[];
    note?: string;
  }[];
};