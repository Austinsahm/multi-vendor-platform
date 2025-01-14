"use client";

import { Button } from "@/components/ui/button";
import Uploader from "@/components/uploader";
import React from "react";
import UploadProduct from "./upload/page";
import { useUser } from "../actions";
import Link from "next/link";

const VendorPage = () => {
  return (
    <div>
      <Button asChild>
        <Link href={`/vendor/account`}>Profile</Link>
      </Button>

      {/* <Button asChild>
        <button
          onClick={() => {
            document.getElementById("upload-trigger")?.click();
          }}
        >
          Add Products
        </button>
      </Button> */}

      <Button asChild>
        <Link href={`/vendor/upload`}>Add Products</Link>
      </Button>

      {/* <UploadProduct /> */}
    </div>
  );
};

export default VendorPage;
