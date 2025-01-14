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
// For now, if you do not want to install UI components you
// are not using import from lib directly.
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
import { error } from "console";

const Uploader = ({ user }: { user: User | null }) => {
  const supabase = createClient();
  // console.log(user);
  // Input refs for additional fields
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);

  const getProfile = useCallback(async () => {
    try {
      // setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      console.log(data);

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
  });

  const handleUpload = () => {
    const randomUUID = crypto.randomUUID();

    uppy.setFileMeta(uppy.getFiles()[0].id, {
      objectName: user?.id + "/" + randomUUID + "/" + uppy.getFiles()[0].name,
    });

    uppy.upload().then(async () => {
      console.log(description, productName, category, price, stock);

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
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="upload-trigger">Here</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Upload</DialogTitle>
          <DialogDescription>Select your product photo</DialogDescription>
        </DialogHeader>
        <div>
          {" "}
          <Dashboard theme="dark" uppy={uppy} />
        </div>
        <Input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          className="my-2"
        />
        <Input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="my-2"
        />
        <Input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="Price (in NGN)"
          className="my-2"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="my-2"
        />
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value))}
          placeholder="Stock"
          className="my-2"
        />
        <Button className="w-full" onClick={handleUpload}>
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Uploader;
