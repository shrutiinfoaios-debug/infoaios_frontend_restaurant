import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto scrollbar-thin rounded-2xl -mx-0", className)}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div className={cn(
      "premium-card p-5 space-y-4 animate-scroll-fade md:hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTableContainerProps {
  desktopTable: ReactNode;
  mobileCards: ReactNode;
}

export function ResponsiveTableContainer({
  desktopTable,
  mobileCards,
}: ResponsiveTableContainerProps) {
  return (
    <>
      <div className="hidden md:block premium-card overflow-hidden border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
        <div className="overflow-x-auto scrollbar-thin w-full">
          {desktopTable}
        </div>
      </div>
      <div className="md:hidden space-y-5 w-full">{mobileCards}</div>
    </>
  );
}
