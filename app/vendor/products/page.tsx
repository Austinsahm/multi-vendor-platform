import Uploader from "@/components/uploader";
import React from "react";
import { createClient } from "@/utils/supabase/server";
import ProductsLists from "@/components/productsLists";

const Products = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="w-full">
      <div className="flex mb-4 justify-end">
        <Uploader user={user} />
      </div>
      <div className="">
        <ProductsLists />
      </div>
    </div>
    // <div></div>
  );
};

export default Products;
