import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface ViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: Record<string, unknown>;
  audioUrl?: string;
}

export function ViewModal({ open, onOpenChange, title, data }: ViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] animate-scale-in rounded-3xl max-h-[85vh] overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl pointer-events-none" />
        <DialogHeader className="relative space-y-3 pb-4 border-b border-border/30">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            View detailed information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto scrollbar-thin relative pr-2">
          {Object.entries(data).map(([key, value], index) => (
            <div 
              key={key} 
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/40 via-muted/30 to-muted/20 border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-semibold text-foreground min-w-[160px] capitalize text-sm">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-muted-foreground flex-1">
                {typeof value === 'boolean' ? (
                  <Badge variant={value ? 'success' : 'outline'} className="shadow-sm">
                    {value ? 'Yes' : 'No'}
                  </Badge>
                ) : typeof value === 'object' && value !== null ? (
                  <pre className="text-sm font-mono bg-background/50 p-3 rounded-lg border border-border/30 overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="text-foreground font-medium">{String(value)}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
