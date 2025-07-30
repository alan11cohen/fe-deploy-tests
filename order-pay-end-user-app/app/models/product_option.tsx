import { ProductOptionValue } from "./product_option_value";

export type ProductOption = {
  id: number;
  name: string;
  description: string | null;
  type: "single-choice" | "multiple-choice";
  limit: number;
  productOptionValues: ProductOptionValue[];
};