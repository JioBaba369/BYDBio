import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Linkedin, Github, Twitter, Send } from "lucide-react";

// Mock data
const userProfile = {
  username: "janedoe",
  name: "Jane Doe",
  avatarUrl: "https://placehold.co/200x200.png",
  bio: "Senior Product Designer at Acme Inc. Crafting user-centric experiences that bridge business goals and user needs. Passionate about design systems and accessibility.",
  links: [
    { title: "Personal Website", url: "#", icon: <Globe className="h-5 w-5" /> },
    { title: "LinkedIn", url: "#", icon: <Linkedin className="h-5 w-5" /> },
    { title: "GitHub", url: "#", icon: <Github className="h-5 w-5" /> },
    { title: "Twitter / X", url: "#", icon: <Twitter className="h-5 w-5" /> },
    { title: "Contact Me", url: "#", icon: <Send className="h-5 w-5" /> },
  ],
};

export default function LinkInBioPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch user data based on params.username
  const { name, avatarUrl, bio, links } = userProfile;

  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-background/80 backdrop-blur-sm p-6 sm:p-8 shadow-2xl rounded-2xl border-primary/10">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
              <AvatarImage src={avatarUrl} alt={name} data-ai-hint="woman smiling" />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-3xl font-bold text-foreground">{name}</h1>
            <p className="mt-2 text-muted-foreground font-body">{bio}</p>
          </div>

          <div className="mt-8 flex flex-col space-y-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full h-14 text-base font-semibold justify-start p-4 hover:bg-primary/10 hover:border-primary">
                  {link.icon}
                  <span className="flex-1 text-center">{link.title}</span>
                </Button>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
             <a href="/u/janedoe/card" className="text-sm text-primary hover:underline font-semibold">
                View Digital Business Card
             </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
