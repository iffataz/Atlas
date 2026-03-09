import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Request body must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    const terms: string[] = body
      .filter((item): item is string => typeof item === "string")
      .slice(0, 20)
      .map((t) => t.trim().slice(0, 50))
      .filter((t) => t.length > 0);

    if (terms.length === 0) {
      return NextResponse.json(
        { error: "No valid search terms provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const results = await Promise.all(
      terms.map(async (term) => {
        const products = await Product.aggregate([
          {
            $search: {
              index: "nodupecatalog",
              text: {
                query: term,
                path: { wildcard: "*" },
              },
            },
          },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              Product_Name: 1,
              Brand: 1,
              Package_price: 1,
              Price_per_unit: 1,
              package_size: 1,
              Product_Url: 1,
              is_special: 1,
            },
          },
        ]);
        return { term, products };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
