import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SellerProfileForm } from "@/app/components/seller/SellerProfileForm";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default async function SellerProfile() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  // const user = session.user;

  // Fetch full user data from database to get all address fields
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      zipcode: true,
      country: true,
      businessPhone: true,
      displayLocation: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const initialData = {
    addressLine1: user.addressLine1 ?? null,
    addressLine2: user.addressLine2 ?? null,
    city: user.city ?? null,
    state: user.state ?? null,
    zipcode: user.zipcode ?? null,
    country: user.country ?? null,
    businessPhone: user.businessPhone ?? null,
    displayLocation: user.displayLocation ?? null,
  };

  return (
    <Card className="container mx-auto max-w-full p-2" >
      <CardContent className="p-0">
        <Collapsible className="rounded-md">
          <CollapsibleTrigger asChild>
            <div>
              <Button variant="ghost">
                Click here to Add/Update your Business Address Details
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent >
            <SellerProfileForm initialData={initialData} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>



  );
}
