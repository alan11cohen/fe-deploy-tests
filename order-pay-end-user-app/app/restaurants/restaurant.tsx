export type Restaurant = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  imageUrl?: string | null;
}
