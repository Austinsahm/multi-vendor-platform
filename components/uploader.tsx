"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/lib/Dashboard";
import Tus from "@uppy/tus";
import { useState } from "react";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

const Uploader = ({ user }: { user: User | null }) => {
  const router = useRouter();
  const supabase = createClient();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);

  const getProfile = useCallback(async () => {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }
    } catch (error) {
      alert("Error loading user data!");
    } finally {
      // setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  const onBeforeRequest = async (req: any) => {
    const { data } = await supabase.auth.getSession();
    req.setHeader("Authorization", `Bearer ${data.session?.access_token}`);
  };

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ["image/*"],
        maxFileSize: 5 * 1000 * 1000,
      },
    }).use(Tus, {
      endpoint:
        process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/upload/resumable",
      onBeforeRequest,
      allowedMetaFields: [
        "bucketName",
        "objectName",
        "contentType",
        "cacheControl",
      ],
    })
  );

  uppy.on("file-added", (file) => {
    file.meta = {
      ...file.meta,
      bucketName: "product-images",
      contentType: file.type,
    };

    console.log("file added", file);
  });

  uppy.on("upload-success", () => {
    uppy.cancelAll();

    setProductName("");
    setDescription("");
    setPrice(0);
    setCategory("");
    setStock(0);

    document.getElementById("trigger-close")?.click();
    router.refresh();
  });

  const handleUpload = () => {
    if (uppy.getFiles().length !== 0) {
      const randomUUID = crypto.randomUUID();

      uppy.setFileMeta(uppy.getFiles()[0].id, {
        objectName: user?.id + "/" + randomUUID + "/" + uppy.getFiles()[0].name,
      });

      uppy.upload().then(async () => {
        // console.log(description, productName, category, price, stock);

        const { error } = await supabase
          .from("products")
          .update({
            description: description,
            product_name: productName,
            category: category,
            price: price,
            stock: stock,
          })
          .eq("id", randomUUID);

        if (error) {
          toast.error("Fail to update Details.");
        }

        if (error) {
          throw new Error(error.message);
        }

        toast.success("Product uploaded successfully!");
      });
    } else {
      toast.warning("Please add in an image");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="upload-trigger">Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Upload</DialogTitle>
          <DialogDescription>
            Fill in the details and select your product photo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            {" "}
            <Dashboard theme="dark" uppy={uppy} />
          </div>
          <div>
            {" "}
            <div className="flex flex-col">
              {" "}
              <label htmlFor="product-name" className="text-xs">
                Product Name
              </label>
              <Input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex. Flexible Comb"
                className="my-2"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="category" className="text-xs">
                Category
              </label>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex. Hair Care"
                className="my-2"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description" className="text-xs">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex. Flexible Comb is a hair care product that helps to detangle hair"
                className="my-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="">
                <label htmlFor="price" className="text-xs">
                  Price (in NGN)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="my-2"
                  required
                />
              </div>
              <div className="">
                <label htmlFor="stock" className="text-xs">
                  Stock
                </label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value))}
                  placeholder="Stock"
                  className="my-2"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleUpload}>
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Uploader;
