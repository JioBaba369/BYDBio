import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, PlusCircle, Trash2, User, CreditCard, Link2, Upload, Phone, Mail, Globe, MapPin, Building, Linkedin } from "lucide-react"
import HashtagSuggester from "@/components/ai/hashtag-suggester"
import Image from "next/image"

export default function ProfilePage() {
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
          <TabsTrigger value="links"><Link2 className="mr-2 h-4 w-4"/>Links</TabsTrigger>
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
                <Input id="name" defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="janedoe" />
              </div>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/200x200.png" data-ai-hint="woman smiling"/>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Change Photo</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={5} defaultValue="Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs." />
                <HashtagSuggester content="Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs." onSelectHashtag={(tag) => {
                  const bio = document.getElementById('bio') as HTMLTextAreaElement;
                  bio.value += ` ${tag}`;
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
                  <Input id="card-title" defaultValue="Senior Product Designer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-company">Company</Label>
                  <Input id="card-company" defaultValue="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-phone">Phone</Label>
                  <Input id="card-phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-email">Email</Label>
                  <Input id="card-email" type="email" defaultValue="jane.doe@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-website">Website</Label>
                  <Input id="card-website" defaultValue="janedoe.design" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="card-linkedin">LinkedIn</Label>
                  <Input id="card-linkedin" defaultValue="linkedin.com/in/janedoe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-location">Location</Label>
                  <Input id="card-location" defaultValue="San Francisco, CA" />
                </div>
                <Button>Update Card</Button>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
                <p className="font-semibold mb-4 text-center">Card Preview</p>
                <div className="w-full max-w-[280px] bg-background p-6 rounded-xl shadow-lg border">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-2">
                      <AvatarImage src="https://placehold.co/200x200.png" data-ai-hint="woman smiling"/>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <p className="font-headline font-semibold text-lg">Jane Doe</p>
                    <p className="text-primary text-sm">Senior Product Designer</p>
                  </div>
                  <Image src="https://placehold.co/250x250.png" width={200} height={200} alt="QR Code Preview" className="mx-auto mt-4 rounded-md" data-ai-hint="qr code" />
                   <p className="text-xs text-muted-foreground text-center mt-2">Scan to Share</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Manage Links</CardTitle>
              <CardDescription>Add, edit, or remove links for your link-in-bio page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="link-title-1">Link Title</Label>
                    <Input id="link-title-1" defaultValue="Personal Website" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="link-url-1">URL</Label>
                    <Input id="link-url-1" defaultValue="https://janedoe.design" />
                  </div>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="link-title-2">Link Title</Label>
                    <Input id="link-title-2" defaultValue="LinkedIn" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="link-url-2">URL</Label>
                    <Input id="link-url-2" defaultValue="https://linkedin.com/in/janedoe" />
                  </div>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <Button variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add Another Link</Button>
              <div className="pt-4">
                <Button>Save Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
