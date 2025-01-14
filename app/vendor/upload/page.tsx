import Uploader from "@/components/uploader";
import React from "react";
import { createClient } from "@/utils/supabase/server";

const Upload = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  
  return (
    <div>
      <Uploader user={user} />
    </div>
  );
};

export default Upload;
