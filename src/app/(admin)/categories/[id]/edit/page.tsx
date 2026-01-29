import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CategoryForm } from "@/app/components/admin/CategoryForm";
import { getCategory } from "@/actions/category.action";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
    params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/admin-dashboard/categories">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
      </Button>

      <CategoryForm initialData={category} />
    </div>
  );
}