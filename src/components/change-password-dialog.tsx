
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { useToast } from "@/hooks/use-toast";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset(); // Reset form when dialog is closed
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (!firebaseUser || !firebaseUser.email) {
        toast({ title: "Error", description: "You must be logged in to change your password.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, data.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, data.newPassword);
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Change password error:", error);
      let description = "An unexpected error occurred.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "The current password you entered is incorrect.";
          form.setError("currentPassword", { type: "manual", message: description });
      } else if (error.code === 'auth/too-many-requests') {
          description = "Too many attempts. Please try again later.";
      }
      toast({
        title: "Error Changing Password",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
