import { ProductOption } from "./product_option";

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
  hide?: boolean | null;
  acceptsNotes: boolean;
  isVegan: boolean;
  glutenFree: boolean;
  category?: string | null;
  productOptions: ProductOption[];
};