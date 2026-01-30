"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteLotAction } from "@/actions/delete-lot.action";
import { format } from "date-fns";

interface Lot {
  id: string;
  title: string;
  status: string;
  auction: {
    title: string;
    status: string;
  } | null;
  store: {
    name: string;
  };
  _count: {
    items: number;
  };
  createdAt: string;
}
interface LotsTableProps {
  lots: Lot[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-orange-500 border-transparent",
  SCHEDULED: "bg-orange-500 border-transparent",
  RESEND: "bg-amber-500 border-transparent",  // Add this
  LIVE: "bg-green-500 border-transparent",
  SOLD: "bg-purple-500 border-transparent",
  UNSOLD: "bg-red-500 border-transparent",
};

export function LotsTable({ lots }: LotsTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (lotId: string) => {
    router.push(`/my-auctions/lots/edit?lotId=${lotId}`);
  };

  const handleDeleteClick = (lotId: string) => {
    setLotToDelete(lotId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lotToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteLotAction(lotToDelete);

      if (result.error) {
        toast.error("Error", {
          description: result.error,
          duration: 5000,
        });
      } else {
        toast.success("Lot Deleted", {
          description: "The lot has been deleted successfully.",
          duration: 3000,
        });
        router.refresh();
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to delete lot. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLotToDelete(null);
    }
  };

  if (lots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No lots found. Create your first lot to get started.
      </div>
    );
  }

  return (
    <>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Auction</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot, index) => (
              <motion.tr
                key={lot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{lot.title}</TableCell>
                <TableCell>
                  {lot.auction ? (
                    <span>{lot.auction.title}</span>
                  ) : (
                    <span className="text-muted-foreground">No auction</span>
                  )}
                </TableCell>
                <TableCell>{lot._count.items}</TableCell>
                <TableCell >

                  <Badge variant="outline" className={`${statusColors[lot.status] || "bg-gray-500 border-transparent"}`}>{lot.status}</Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(lot.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {lot.status === "DRAFT" && (
                        <>
                          <DropdownMenuItem onClick={() => handleEdit(lot.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteClick(lot.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {lot.status !== "DRAFT" && (
                        <DropdownMenuItem disabled>
                          <span className="text-muted-foreground text-xs">
                            Only drafts can be edited or deleted
                          </span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lot
              and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}