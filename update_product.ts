import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("supplier_products")
    .update({ product_type: "Sweaters", status: "APPROVED" })
    .eq("id", "ad4537c7-9268-46da-9d24-833bff958361")
    .select();

  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log(`Updated ${data.length} products to Sweaters and APPROVED.`);
  }
}

main();
