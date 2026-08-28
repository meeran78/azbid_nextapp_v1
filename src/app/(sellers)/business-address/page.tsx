import SellerProfile from "@/app/components/seller/SellerProfile";
import { MapPin } from "lucide-react";

export default function BusinessAddressPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Address</h1>
          <p className="text-muted-foreground mt-1">
            Update your business address details
          </p>
        </div>
        <MapPin className="h-8 w-8 text-muted-foreground" />
      </div>

      <SellerProfile />
    </div>
  );
}
