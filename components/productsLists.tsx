"use client";

import { fetchProductsByVendorIdAction } from "@/app/actions";
import { Product } from "@/app/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { formatCurrency } from "@/utils/format";

const ProductsLists = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      try {
        const fetchedProducts = await fetchProductsByVendorIdAction();
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group overflow-hidden transition-all hover:shadow-lg"
        >
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg truncate">
              {product.product_name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="pt-2">
              <p className="font-bold text-lg">
                ₦{formatCurrency(product.price)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductsLists;
