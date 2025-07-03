
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, UserMinus, QrCode } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "@/components/qr-scanner";
import { currentUser } from "@/lib/mock-data";
import { allUsers as initialAllUsers } from "@/lib/users";
import Link from "next/link";
import { saveAs } from "file-saver";

// Define a user type for clarity
type User = (typeof initialAllUsers)[0] & { isFollowedByCurrentUser?: boolean };

export default function ConnectionsPage() {
    const [allUsers, setAllUsers] = useState<User[]>(initialAllUsers);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedVCardData, setScannedVCardData] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    // Memoize lists to avoid re-calculation on every render
    const { followersList, followingList } = useMemo(() => {
        const me = allUsers.find(u => u.id === currentUser.id)!;

        // Users who are following the current user
        const followers = allUsers
            .filter(u => u.following.includes(currentUser.id))
            .map(u => ({
                ...u,
                // Check if the current user is following them back
                isFollowedByCurrentUser: me.following.includes(u.id)
            }));

        // Users the current user is following
        const following = allUsers.filter(u => me.following.includes(u.id));

        return { followersList: followers, followingList: following };
    }, [allUsers]);
    
    // This is a mock function. In a real app, this would be an API call.
    // It updates the client-side state, which will be lost on refresh.
    const toggleFollow = (userIdToToggle: string) => {
        setAllUsers(prevUsers => {
            return prevUsers.map(user => {
                if (user.id === currentUser.id) {
                    const following = user.following.includes(userIdToToggle)
                        ? user.following.filter(id => id !== userIdToToggle)
                        : [...user.following, userIdToToggle];
                    return { ...user, following };
                }
                return user;
            });
        });
    };

    const removeFollower = (followerIdToRemove: string) => {
         setAllUsers(prevUsers => {
            return prevUsers.map(user => {
                if (user.id === followerIdToRemove) {
                    const following = user.following.filter(id => id !== currentUser.id);
                    return { ...user, following };
                }
                return user;
            });
        });
    };

    const handleSaveVCard = () => {
        if (!scannedVCardData) return;
        const blob = new Blob([scannedVCardData], { type: "text/vcard;charset=utf-8" });
        const nameMatch = scannedVCardData.match(/FN:(.*)/);
        const name = nameMatch ? nameMatch[1].trim().split(';')[0].replace(/ /g, '_') : 'contact';
        saveAs(blob, `${name}.vcf`);
        setScannedVCardData(null);
        toast({
            title: "Contact Saved",
            description: "The VCF file has been downloaded to your device.",
        });
    };

    const handleQrScanSuccess = (decodedText: string) => {
      // Close scanner immediately
      setIsScannerOpen(false);

      // Case 1: Scanned a vCard
      if (decodedText.startsWith('BEGIN:VCARD')) {
        setScannedVCardData(decodedText);
        return;
      }

      // Case 2: Scanned a profile URL
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        
        if (pathParts.length >= 3 && pathParts[1] === 'u') {
          const username = pathParts[2];
          const userToFollow = initialAllUsers.find(u => u.username === username);

          if (!userToFollow) {
            toast({
              title: "User Not Found",
              description: `The profile for "${username}" could not be found.`,
              variant: "destructive",
            });
            return;
          }

          if (userToFollow.id === currentUser.id) {
            toast({
              title: "Cannot Follow Yourself",
              description: "You can't connect with your own profile.",
              variant: "destructive",
            });
            return;
          }

          const me = allUsers.find(u => u.id === currentUser.id)!;
          if (me.following.includes(userToFollow.id)) {
            toast({
              title: "Already Following",
              description: `You are already following ${userToFollow.name}.`,
            });
            return;
          }
          
          toggleFollow(userToFollow.id);
          toast({
            title: "Connection Successful!",
            description: `You are now following ${userToFollow.name}.`,
          });
          return;
        }
      } catch (error) {
        // Not a valid URL, will fall through to the invalid code error
      }
      
      // Case 3: Invalid QR code
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid profile or contact QR code.",
        variant: "destructive",
      });
    };


  return (
    <>
      <AlertDialog open={!!scannedVCardData} onOpenChange={(open) => !open && setScannedVCardData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Card Scanned</AlertDialogTitle>
            <AlertDialogDescription>
              This QR code contains contact information (vCard). Would you like to save it to your device?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScannedVCardData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveVCard}>Save Contact</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Connections</h1>
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
                      <DialogTitle>Scan a Profile or Contact QR Code</DialogTitle>
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
              <div className="flex flex-col gap-4">
                  {followersList.map((user) => (
                      <Card key={user.id}>
                          <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                  <Link href={`/u/${user.handle}`} className="flex items-center gap-4 hover:underline">
                                      <Avatar>
                                          <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <p className="font-semibold">{user.name}</p>
                                          <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                      </div>
                                  </Link>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                      <Button size="sm" variant={user.isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => toggleFollow(user.id)}>
                                          {user.isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                          {user.isFollowedByCurrentUser ? 'Following' : 'Follow Back'}
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFollower(user.id)}>
                                          <UserMinus className="mr-2 h-4 w-4" />
                                          Remove
                                      </Button>
                                  </div>
                              </div>
                              {user.bio && (
                                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{user.bio}</p>
                              )}
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </TabsContent>
          <TabsContent value="following">
             <div className="flex flex-col gap-4">
                {followingList.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                 <Link href={`/u/${user.handle}`} className="flex items-center gap-4 hover:underline">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} data-ai-hint="person portrait" />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{user.handle}</p>
                                    </div>
                                </Link>
                                <Button size="sm" variant="secondary" onClick={() => toggleFollow(user.id)}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Unfollow
                                </Button>
                            </div>
                             {user.bio && (
                                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{user.bio}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
