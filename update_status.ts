import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("supplier_products")
    .update({ status: "APPROVED" })
    .eq("status", "PENDING")
    .select();

  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log(`Updated ${data.length} products to APPROVED.`);
  }
}

main();
