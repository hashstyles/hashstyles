export type Product = {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
  sizes?: string[];
  colors?: string[];
  inventory?: number;
  createdAt?: any;
};
