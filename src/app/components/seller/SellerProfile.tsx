import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SellerProfileForm } from "@/app/components/seller/SellerProfileForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


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
      <div className="container mx-auto max-w-5xl py-8">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold">Seller Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your business address and contact details shown to buyers.
        </p>
      </div> */}

      <Card>
        {/* <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update your business address and contact information
          </CardDescription>
        </CardHeader> */}
        <CardContent>
          <Accordion type="single" collapsible defaultValue="business-address" className="w-full">
            <AccordionItem value="business-address">
              <AccordionTrigger>Business Address Details - Update your business address and contact information</AccordionTrigger>
              <AccordionContent>
                <SellerProfileForm initialData={initialData} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
  