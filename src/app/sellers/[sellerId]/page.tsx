import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSellerById } from "@/actions/public-seller.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Store,
  Building2,
} from "lucide-react";

function formatAddress(seller: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
}): string | null {
  const parts = [
    seller.addressLine1,
    seller.addressLine2,
    [seller.city, seller.state, seller.zipcode].filter(Boolean).join(", "),
    seller.country,
  ].filter(Boolean);
  return parts.length > 0 ? (parts as string[]).join("\n") : null;
}

function formatPhone(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  const seller = await getSellerById(sellerId);

  if (!seller) notFound();

  const addressBlock = formatAddress(seller);
  const displayName = seller.companyName || seller.name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-muted shrink-0">
              {seller.image ? (
                <Image
                  src={seller.image}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 128px, 160px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              {seller.companyName && seller.companyName !== seller.name && (
                <p className="text-muted-foreground mt-1">{seller.name}</p>
              )}
              {seller.displayLocation && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {seller.displayLocation}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {addressBlock && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm whitespace-pre-line">{addressBlock}</div>
            </div>
          )}
          {seller.businessPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <a
                href={`tel:${seller.businessPhone}`}
                className="text-foreground hover:underline"
              >
                {formatPhone(seller.businessPhone)}
              </a>
            </div>
          )}
          {seller.businessEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <a
                href={`mailto:${seller.businessEmail}`}
                className="text-foreground hover:underline"
              >
                {seller.businessEmail}
              </a>
            </div>
          )}
          {seller.businessWebsite && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <a
                href={seller.businessWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                {seller.businessWebsite}
              </a>
            </div>
          )}

          {seller.stores.length > 0 && (
            <div className="pt-6 border-t space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store auctions
              </h3>
              <ul className="space-y-2">
                {seller.stores.map((store) => (
                  <li key={store.id}>
                    <Button asChild>
                      <Link href={`/stores/${store.id}`}>
                        View {store.name} — Browse lots & bid
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
