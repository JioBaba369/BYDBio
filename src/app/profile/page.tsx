
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Trash2, User, CreditCard, Link2 as LinkIcon, Upload, GripVertical } from "lucide-react"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import { useEffect, useState } from "react";
import QRCode from 'qrcode.react';
import { currentUser } from "@/lib/mock-data";
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { availableIconNames, linkIcons, linkIconData } from "@/lib/link-icons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const linksFormSchema = z.object({
  links: z.array(
    z.object({
      icon: z.enum(availableIconNames, {
        errorMap: () => ({ message: "Please select an icon." }),
      }),
      title: z.string().min(1, "Title cannot be empty."),
      url: z.string().url("Please enter a valid URL."),
    })
  ),
});

type LinksFormValues = z.infer<typeof linksFormSchema>;

const SortableLinkItem = ({ field, index, remove }: { field: { id: string }, index: number, remove: (index: number) => void }) => {
  const { control, watch, setValue } = useFormContext<LinksFormValues>();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const selectedIconName = watch(`links.${index}.icon`);
  const Icon = selectedIconName ? linkIcons[selectedIconName] : null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 p-4 border rounded-lg bg-background/50 touch-none">
      <div {...listeners} className="mt-8 shrink-0 cursor-grab p-2 -ml-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        <FormField
          control={control}
          name={`links.${index}.icon`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const data = linkIconData[value as keyof typeof linkIconData];
                  if (data) {
                    setValue(`links.${index}.title`, data.title, { shouldDirty: true });
                    setValue(`links.${index}.url`, data.urlPrefix, { shouldDirty: true });
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <div className={cn("flex items-center gap-2", !field.value && "text-muted-foreground")}>
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <SelectValue placeholder="Select icon" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIconNames.map((iconName) => {
                    const data = linkIconData[iconName];
                    const LoopIcon = data.icon;
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <LoopIcon className="h-4 w-4" />
                          <span>{data.title}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`links.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Awesome Portfolio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`links.${index}.url`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-8 shrink-0"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};


export default function ProfilePage() {
  const [bio, setBio] = useState(currentUser.bio);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();

  const linksForm = useForm<LinksFormValues>({
    resolver: zodResolver(linksFormSchema),
    defaultValues: {
      links: currentUser.links || [],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove, move } = useFieldArray({
    control: linksForm.control,
    name: "links",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function onLinksSubmit(data: LinksFormValues) {
    // In a real app, you would save this data to your backend.
    console.log("Updated links data:", data);
    toast({
      title: "Links Saved",
      description: "Your link-in-bio page has been updated.",
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (active.id !== over?.id) {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over!.id);
        move(oldIndex, newIndex);
    }
  }


  useEffect(() => {
    // We can only get the window.location.origin on the client
    if (typeof window !== 'undefined') {
      setQrCodeUrl(`${window.location.origin}/u/${currentUser.username}/card`);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile Editor</h1>
        <p className="text-muted-foreground">Manage your public presence and connections.</p>
      </div>
      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="public"><User className="mr-2 h-4 w-4" />Public Profile</TabsTrigger>
          <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4" />Digital Card</TabsTrigger>
          <TabsTrigger value="links"><LinkIcon className="mr-2 h-4 w-4"/>Links</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Public Information</CardTitle>
              <CardDescription>This information will be displayed on your public profile and link-in-bio page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={currentUser.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={currentUser.username} />
              </div>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatarUrl} data-ai-hint="woman smiling"/>
                    <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Change Photo</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
                <HashtagSuggester content={bio} onSelectHashtag={(tag) => {
                  setBio(prev => prev + ` ${tag}`);
                }} />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Digital Business Card</CardTitle>
              <CardDescription>Enter your details to generate a shareable digital business card and QR code.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-title">Job Title</Label>
                  <Input id="card-title" defaultValue={currentUser.businessCard.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-company">Company</Label>
                  <Input id="card-company" defaultValue={currentUser.businessCard.company} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-phone">Phone</Label>
                  <Input id="card-phone" type="tel" defaultValue={currentUser.businessCard.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-email">Email</Label>
                  <Input id="card-email" type="email" defaultValue={currentUser.businessCard.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-website">Website</Label>
                  <Input id="card-website" defaultValue={currentUser.businessCard.website} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="card-linkedin">LinkedIn</Label>
                  <Input id="card-linkedin" defaultValue={currentUser.businessCard.linkedin} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-location">Location</Label>
                  <Input id="card-location" defaultValue={currentUser.businessCard.location} />
                </div>
                <Button>Update Card</Button>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
                <p className="font-semibold mb-4 text-center">Card Preview</p>
                <div className="w-full max-w-[280px] bg-background p-6 rounded-xl shadow-lg border">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-2">
                      <AvatarImage src={currentUser.avatarUrl} data-ai-hint="woman smiling"/>
                      <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <p className="font-headline font-semibold text-lg">{currentUser.name}</p>
                    <p className="text-primary text-sm">{currentUser.businessCard.title}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    {qrCodeUrl ? (
                      <QRCode value={qrCodeUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="Q" />
                    ) : (
                      <div className="w-[200px] h-[200px] bg-gray-200 animate-pulse mx-auto rounded-md" />
                    )}
                  </div>
                   <p className="text-xs text-muted-foreground text-center mt-2">Scan to Share</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <FormProvider {...linksForm}>
              <form onSubmit={linksForm.handleSubmit(onLinksSubmit)}>
                <CardHeader>
                  <CardTitle>Manage Links</CardTitle>
                  <CardDescription>Add, edit, or remove links for your link-in-bio page. Drag to reorder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <SortableLinkItem
                            key={field.id}
                            field={field}
                            index={index}
                            remove={remove}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ icon: 'Link', title: '', url: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                  </Button>
                </CardContent>
                <CardFooter>
                   <Button type="submit" disabled={!linksForm.formState.isDirty}>Save Links</Button>
                </CardFooter>
              </form>
            </FormProvider>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
