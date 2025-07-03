
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, UserMinus, QrCode } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "@/components/qr-scanner";

const followers = [
  { id: 'user2', name: "John Smith", handle: "johnsmith", avatarUrl: "https://placehold.co/100x100.png", following: true },
  { id: 'user3', name: "Alex Johnson", handle: "alexj", avatarUrl: "https://placehold.co/100x100.png", following: false },
  { id: 'user4', name: "Maria Garcia", handle: "mariag", avatarUrl: "https://placehold.co/100x100.png", following: true },
];

const following = [
    { id: 'user2', name: "John Smith", handle: "johnsmith", avatarUrl: "https://placehold.co/100x100.png", following: true },
    { id: 'user4', name: "Maria Garcia", handle: "mariag", avatarUrl: "https://placehold.co/100x100.png", following: true },
    { id: 'user5', name: "Chris Lee", handle: "chrisl", avatarUrl: "https://placehold.co/100x100.png", following: true },
];

export default function ConnectionsPage() {
    const [followersList, setFollowersList] = useState(followers);
    const [followingList, setFollowingList] = useState(following);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();


    // This is a mock function. In a real app, this would be an API call.
    const toggleFollowInList = (listSetter: React.Dispatch<React.SetStateAction<any[]>>, userId: string) => {
        listSetter(prevList =>
            prevList.map(user =>
                user.id === userId ? { ...user, following: !user.following } : user
            )
        );
    };

    const handleFollowerToggle = (userId: string) => {
        toggleFollowInList(setFollowersList, userId);
        // Also update the 'following' list if the user is in it
        setFollowingList(prevList => {
            const userExists = prevList.some(u => u.id === userId);
            const userDetails = followers.find(u => u.id === userId);
            if (userExists) {
                return prevList.filter(u => u.id !== userId);
            } else if (userDetails) {
                return [...prevList, {...userDetails, following: true}];
            }
            return prevList;
        });
    };

    const handleFollowingToggle = (userId: string) => {
        // Unfollowing from the 'following' list removes them.
        setFollowingList(prevList => prevList.filter(user => user.id !== userId));
        // Update their state in the 'followers' list if they are present.
        setFollowersList(prevList =>
            prevList.map(user =>
                user.id === userId ? { ...user, following: false } : user
            )
        );
    }

    const handleRemoveFollower = (userId: string) => {
        // Remove the user from your followers list.
        setFollowersList(prevList => prevList.filter(user => user.id !== userId));
        // Also remove them from your 'following' list if you were following them.
        setFollowingList(prevList => prevList.filter(user => user.id !== userId));
    };

    const handleQrScanSuccess = (decodedText: string) => {
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        
        // Expecting a URL like /u/[username] or /u/[username]/card
        if (pathParts.length >= 3 && pathParts[1] === 'u') {
          const username = pathParts[2];
          toast({
            title: "Scan Successful",
            description: `Redirecting to ${username}'s profile...`,
          });
          setIsScannerOpen(false);
          router.push(`/u/${username}`);
        } else {
          throw new Error("Invalid QR code");
        }
      } catch (error) {
        console.error("QR Scan Error:", error);
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code is not a valid profile URL.",
          variant: "destructive",
        });
        setIsScannerOpen(false);
      }
    };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Connections</h1>
          <p className="text-muted-foreground">Manage your followers and who you follow.</p>
        </div>
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
            <DialogTrigger asChild>
                <Button>
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan to Connect
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Scan a Profile QR Code</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <QrScanner onScanSuccess={handleQrScanSuccess} />
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">Followers ({followersList.length})</TabsTrigger>
          <TabsTrigger value="following">Following ({followingList.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="followers">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {followersList.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant={user.following ? 'secondary' : 'default'} onClick={() => handleFollowerToggle(user.id)}>
                                    {user.following ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {user.following ? 'Following' : 'Follow'}
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveFollower(user.id)}>
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="following">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {followingList.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleFollowingToggle(user.id)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unfollow
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
