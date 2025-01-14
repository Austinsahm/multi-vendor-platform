"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Product } from "./types";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // Sign in the user
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return encodedRedirect("error", "/sign-in", authError.message);
  }

  // Fetch user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    return encodedRedirect("error", "/sign-in", "Failed to fetch user role");
  }

  // Redirect based on role
  switch (profile.role) {
    case "admin":
      return redirect("/admin");
    case "vendor":
      return redirect("/vendor");
    case "customer":
      return redirect("/customer");
    default:
      return encodedRedirect("error", "/sign-in", "Unknown user role");
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};


export const useUser = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // const { data, error } = await supabase.from("profiles").select("*");
  // if (error) {
  //   throw new Error(error.message);
  // }

  // console.log(user);

  return user;
};

export const fetchAllProductsAction = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    throw new Error(error.message);
  }

  const products: Product[] = data?.map(product =>{ 
    return {
      ...product,
    image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.vendor_id}/${product.id}/${product.name}`,
  
  }})

  
  return products || [];
};


export const fetchProductsByVendorIdAction = async () => {
  const supabase = await createClient();

  try {
    // Fetch the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      throw new Error("User not authenticated.");
    }

    // Fetch products for the authenticated user
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    // Map products to include image URLs
    const products: Product[] =
      data?.map((product) => ({
        ...product,
        image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.vendor_id}/${product.id}/${product.name}`,
      })) || [];
      

    return products;
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred."
    );
  }
};
