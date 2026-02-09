"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreEditDialog, type StoreForEdit } from "@/app/components/seller/StoreEditDialog";

const STORE_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
] as const;

interface Store {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;  
  status: string;
  _count: {
    auctions: number;
    lots: number;
  };
}

interface StoresListProps {
  stores: Store[];
}

export function StoresList({ stores }: StoresListProps) {
  const router = useRouter();
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredStores = useMemo(() => {
    if (statusFilter === "ALL") return stores;
    return stores.filter((s) => s.status === statusFilter);
  }, [stores, statusFilter]);

  const handleStoreClick = (store: Store) => {
    setEditStore(store);
    setEditDialogOpen(true);
  };

  const storeForEdit: StoreForEdit | null = editStore
    ? {
        id: editStore.id,
        name: editStore.name,
        description: editStore.description,
        logoUrl: editStore.logoUrl,
      }
    : null;

  const badgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PENDING":
        return "bg-amber-500";
      case "SUSPENDED":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <>
    <Card className="container mx-auto max-w-full">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Your Stores
        </CardTitle>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STORE_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild size="sm">
            <Link href="/sellers-stores/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stores found. Create your first store to get started.</p>
            <Button asChild className="mt-4">
              <Link href="/my-auctions/stores/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Store
              </Link>
            </Button>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No stores match the selected status.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setStatusFilter("ALL")}
            >
              Show all stores
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  onClick={() => handleStoreClick(store)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStoreClick(store);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {store.logoUrl ? (
                        <Image
                          src={store.logoUrl}
                          alt={store.name}
                          width={48}
                          height={48}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <Badge className={badgeClass(store.status)}>
                          {store.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {store.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auctions:</span>
                        <span className="font-medium">{store._count.auctions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lots:</span>
                        <span className="font-medium">{store._count.lots}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <StoreEditDialog
      store={storeForEdit}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      onSuccess={() => router.refresh()}
    />
    </>
  );
}