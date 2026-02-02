"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  return (


    <Card className="container mx-auto max-w-full p-2" >
      <CardContent className="p-0">
        <Collapsible className=" rounded-md">
          <CollapsibleTrigger asChild>
            <div>
              <Button variant="ghost">
                Click here to Add/Update your Store Details
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Your Stores
                </CardTitle>
                <Button asChild size="sm">
                  <Link href="/my-auctions/stores/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Store
                  </Link>
                </Button>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map((store, index) => (
                      <motion.div
                        key={store.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                                <Badge
                                  className={
                                    store.status === "ACTIVE"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }
                                >
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}