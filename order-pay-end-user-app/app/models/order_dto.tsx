import { Product } from "./product";
import { ProductOption } from "./product_option";
import { ProductOptionValue } from "./product_option_value";

export type OrderDTO = {
  id: number;
  status: string;
  createdAt: string;
  tableId: number;
  restaurantId: number;
  items: {
    id: string;
      product: Product;
      quantity: number;
      note?: string;
      selectedOptions?: {
        id: number;
        productOption: ProductOption;
        values: ProductOptionValue[];
      }[];
  }[];
};
