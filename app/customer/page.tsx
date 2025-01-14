"use client";

import { useState, useEffect } from "react";
import { Product } from "@/app/types";
import { fetchAllProductsAction } from "@/app/actions";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function getProducts() {
      try {
        const fetchedProducts = await fetchAllProductsAction();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="p-4 border rounded">
          <h3>{product.product_name}</h3>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-auto"
          />
          <button>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
