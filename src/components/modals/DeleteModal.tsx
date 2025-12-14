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
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description = "This action cannot be undone. This will permanently delete this item.",
}: DeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="animate-scale-in rounded-3xl border-border/50 bg-gradient-to-br from-card via-card to-card/95 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/10 rounded-3xl pointer-events-none" />
        <AlertDialogHeader className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/20 shadow-lg animate-pulse">
              <Trash2 className="h-7 w-7 text-destructive drop-shadow-lg" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 relative">
          <AlertDialogCancel className="rounded-xl border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/80 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
