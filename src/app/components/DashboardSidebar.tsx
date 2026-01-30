'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Gavel,
  Heart,
  CreditCard,
  Settings,
  CirclePlus,
  HelpCircle,
  Package,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Store,
  Barcode,
  Pickaxe
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/app/components/SignoutButton";
import Image from "next/image";

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const getNavigationItems = (roleType: string): NavigationItem[] => {
  const commonItems: NavigationItem[] = [

    // { title: "Change Password", url: "/change-password", icon: KeyRound },
    // { title: "Help & Support", url: "/help", icon: HelpCircle },
  ];

  switch (roleType) {
    case "BUYER":
      return [
        // { title: "Dashboard", url: "/buyers-dashboard", icon: LayoutDashboard },
        { title: "My Bids", url: "/my-bids", icon: Gavel },
        { title: "My Favorites", url: "/my-favorites", icon: Heart },
        { title: "Payment", url: "/payment", icon: CreditCard },
        { title: "Settings", url: "/buyer-settings", icon: Settings },
        { title: "Help & Support", url: "/help-support", icon: HelpCircle },
        ...commonItems,
      ];
    case "SELLER":
      return [
        // { title: "Dashboard", url: "/sellers-dashboard", icon: LayoutDashboard },
        { title: "My Auctions", url: "/my-auctions", icon: Package },
        { title: "Payment", url: "/payment", icon: CreditCard },
        { title: "Settings", url: "/seller-settings", icon: Settings },
        { title: "Help & Support", url: "/help-support", icon: HelpCircle },
        ...commonItems,
      ];
    case "ADMIN":
      return [
        // { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
        { title: "Stores Management", url: "/stores-management", icon: Store },
        { title: "Lots Management", url: "/lots-management", icon: Barcode },
        { title: "Auctions Managements", url: "/auctions-management", icon: Pickaxe },
        { title: "Category Management", url: "/categories", icon: CirclePlus },
        { title: "Users", url: "/users", icon: Users },
        { title: "Analytics", url: "/analytics", icon: BarChart3 },
        { title: "Payment", url: "/payment", icon: CreditCard },
        { title: "FAQs", url: "/faqs", icon: HelpCircle },
        { title: "Settings", url: "/admin-settings", icon: Settings },
        { title: "Help & Support", url: "/help-support", icon: HelpCircle },

        ...commonItems,
      ];
    default:
      return commonItems;
  }
};

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const roleType = session?.user?.role || "BUYER";
  const navigationItems = getNavigationItems(roleType);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = (url: string) => {
    return pathname === url || pathname?.startsWith(url + "/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Menu Button */}
      <Button
  variant="ghost"
  size="icon"
  className="fixed top-[calc(var(--header-height)-44px)] left-4 z-50 md:hidden"
  onClick={toggleMobileSidebar}
>
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleMobileSidebar}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-[140px] h-[calc(100vh-140px)] w-72 bg-card border-r border-border z-50 md:hidden shadow-xl"
            >
              <SidebarContent
                navigationItems={navigationItems}
                isActive={isActive}
                isCollapsed={false}
                onClose={toggleMobileSidebar}
                session={session}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "5rem" : "16rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "hidden md:flex fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height)-var(--footer-height))] bg-card border-r border-border z-30 flex-col shadow-lg",
          isCollapsed && "items-center"
        )}
        
      >
        <SidebarContent
          navigationItems={navigationItems}
          isActive={isActive}
          isCollapsed={isCollapsed}
          onToggle={toggleSidebar}
          session={session}
        />
      </motion.aside>

      {/* Sidebar Spacer for Desktop */}
      <div
        className={cn(
          "hidden md:block transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      />
    </div>
  );
}

interface SidebarContentProps {
  navigationItems: NavigationItem[];
  isActive: (url: string) => boolean;
  isCollapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  session: any;
}

function SidebarContent({
  navigationItems,
  isActive,
  isCollapsed,
  onToggle,
  onClose,
  session,
}: SidebarContentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-border">
        {/* <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/images/azbid-logo.jpg"
                alt="AzBid Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AzBid
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/images/azbid-logo.jpg"
                alt="AzBid Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence> */}

        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-muted"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Info */}
      {session?.user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-4 border-b border-border "
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 ml-4"
              >
                <p className="text-sm font-semibold truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      session.user.role === "BUYER" && "bg-blue-600",
                      session.user.role === "SELLER" && "bg-purple-600",
                      session.user.role === "ADMIN" && "bg-red-600"
                    )}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    Logged in as {session.user.role?.toLowerCase()}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center bg-orange-500 rounded-full"
              >
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                    session.user.role === "BUYER" && "bg-blue-600",
                    session.user.role === "SELLER" && "bg-purple-600",
                    session.user.role === "ADMIN" && "bg-red-600"
                  )}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <motion.div
              key={item.url}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.url} onClick={onClose}>
                <motion.div
                  whileHover={{
                    scale: 1.03,
                    x: 6,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer group overflow-hidden",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Hover background effect */}
                  {!active && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 rounded-lg"
                      initial={false}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <motion.div
                    className="relative z-10"
                    whileHover={{
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-all duration-300",
                        active && "scale-110 text-primary-foreground",
                        !active && "group-hover:scale-110 group-hover:text-primary"
                      )}
                    />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 font-medium text-sm whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <Separator className="my-2" />

      {/* Footer */}
      {/* <div className="px-5 py-4 space-y-2">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <SignOutButton />
          </motion.div>
        )}
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <SignOutButton />
          </motion.div>
        )} 
      </div>*/}
    </div>
  );
}
