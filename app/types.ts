export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor_id: string;
  stock: number;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  is_active?: boolean;
}
