import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSellerStores, getSellerStoresForLots } from "@/actions/seller-dashboard.action";

export async function GET(request: Request) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const approvedOnly = searchParams.get("approvedOnly") === "true";

  try {
    const stores = approvedOnly
      ? await getSellerStoresForLots(session.user.id)
      : await getSellerStores(session.user.id);
    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}