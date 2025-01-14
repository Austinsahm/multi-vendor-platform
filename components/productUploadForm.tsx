"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProductUploadForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !price || !category || !image) {
      setMessage("Please fill out all required fields and select an image.");
      return;
    }

    try {
      // Get the authenticated user's ID (vendorId)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User not authenticated.");
        return;
      }

      const vendorId = user.id;

      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images") // Replace with your bucket name
        .upload(`${vendorId}/${Date.now()}_${image.name}`, image);

      if (uploadError) {
        setMessage(`Image upload failed: ${uploadError.message}`);
        return;
      }

      // Get the public URL of the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

      // Insert the product details into the database
      const { error: insertError } = await supabase.from("products").insert({
        vendor_id: vendorId,
        name,
        description,
        price: parseFloat(price),
        image_url: publicUrl,
        category,
        stock,
      });

      if (insertError) {
        setMessage(`Product upload failed: ${insertError.message}`);
        return;
      }

      setMessage("Product uploaded successfully!");
      // Reset the form
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock(0);
      setImage(null);
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Upload a New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload Product
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
