import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Read the Bearer token passed by the client
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ products: [] });
    }

    // Create a Supabase client that uses this user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    // Validate the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ products: [] });
    }

    // Fetch this supplier's OWN products (all statuses)
    const { data, error } = await supabase
      .from("supplier_products")
      .select("*")
      .eq("supplier_id", user.id)
      .neq("status", "APPROVED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/my-products] fetch error:", error.message);
      return NextResponse.json({ products: [] });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    console.error("[/api/my-products] unexpected error:", err);
    return NextResponse.json({ products: [] });
  }
}
