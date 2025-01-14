"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProductsByVendorIdAction } from "../actions";
import { Product } from "../types";

const VendorPage = () => {
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

  return (
    <div>
      <div>
        {" "}
        <Button asChild>
          <Link href={`/vendor/account`}>Profile</Link>
        </Button>
        <Button asChild>
          <Link href={`/vendor/products`}>My Products</Link>
        </Button>
      </div>
    </div>
  );
};

export default VendorPage;
