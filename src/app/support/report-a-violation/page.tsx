
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";

export default function ReportViolationPage() {
    const { toast } = useToast();
    const form = useForm();
    
    const onSubmit = () => {
        toast({
            title: "Report Submitted",
            description: "Thank you for helping keep our community safe. Our team will review your report shortly.",
        });
        form.reset({ link: '', details: ''});
    };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2"><ShieldAlert />Report a Violation</CardTitle>
        <CardDescription>
          If you've encountered content or a user that violates our community guidelines, please let us know. We take all reports seriously.
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardContent className="p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link to Content/Profile</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., https://byd.bio/u/username/posts/123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Details of Violation</FormLabel>
                                <FormControl>
                                    <Textarea rows={6} placeholder="Please provide specific details about the violation. What happened? Which rule was broken?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit Report</Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
