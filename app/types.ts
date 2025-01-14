export interface Product {
  id: string;
  name: string;
  product_name: string
  description: string;
  price: number;
  category: string;
  vendor_id: string;
  stock: number;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
  image_url: string
}

export interface Profiles {
  id: string;
  role: string;
  username: string;
  fullname: string;
  avatar_url: string;
  email: string;
  updated_at?: string;
}
