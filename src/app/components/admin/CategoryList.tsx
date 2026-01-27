"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { deleteCategoryAction } from "@/actions/category.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const result = await deleteCategoryAction(id);
      if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
      } else {
        toast.success("Category deleted");
        router.refresh();
      }
    } catch (error: any) {
      toast.error("Failed to delete category", {
        description: error.message,
      });
    }
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No categories found.</p>
          <Button asChild className="mt-4">
            <Link href="/admin-dashboard/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Categories</CardTitle>
        <CardDescription>
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    {category.imageUrl ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.itemCount} items</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        category.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/admin-dashboard/categories/${category.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id, category.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}