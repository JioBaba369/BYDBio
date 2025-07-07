
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Button } from "./ui/button"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  itemName?: string;
  itemDescription?: string;
  confirmationText?: string;
  confirmationLabel?: string;
}

export function DeleteConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  isLoading = false, 
  itemName = 'item', 
  itemDescription, 
  confirmationText, 
  confirmationLabel 
}: DeleteConfirmationDialogProps) {
  const [input, setInput] = useState("");
  const isConfirmed = !confirmationText || input === confirmationText;

  const handleConfirm = () => {
      if (isConfirmed && !isLoading) {
          onConfirm();
      }
  }

  const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
          setInput(""); // Reset on close
      }
      onOpenChange(isOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemDescription || `This action cannot be undone. This will permanently delete this ${itemName} and remove its data from our servers.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {confirmationText && (
            <div className="space-y-2">
                <Label htmlFor="confirmation">
                    {confirmationLabel || `To confirm, please type "${confirmationText}" below.`}
                </Label>
                <Input
                    id="confirmation"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoComplete="off"
                />
            </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={!isConfirmed || isLoading}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
