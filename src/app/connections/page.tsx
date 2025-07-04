
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, UserMinus, QrCode, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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
import Link from "next/link";
import { saveAs } from "file-saver";
import { useAuth } from "@/components/auth-provider";
import type { User } from "@/lib/users";
import { followUser, unfollowUser, getFollowers, getFollowing, getSuggestedUsers } from "@/lib/connections";
import { Skeleton } from "@/components/ui/skeleton";

const ConnectionCardSkeleton = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </CardContent>
    </Card>
);

export default function ConnectionsPage() {
    const { user, loading: authLoading } = useAuth();
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const [suggestedList, setSuggestedList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingFollowId, setTogglingFollowId] = useState<string | null>(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedVCardData, setScannedVCardData] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [followers, following, suggested] = await Promise.all([
                        getFollowers(user.uid),
                        getFollowing(user.uid),
                        getSuggestedUsers(user.uid, user.following)
                    ]);
                    setFollowersList(followers);
                    setFollowingList(following);
                    setSuggestedList(suggested);
                } catch (error) {
                    console.error("Error fetching connections:", error);
                    toast({ title: "Error fetching connections", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [user, toast]);

    const handleToggleFollow = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
        if (!user || togglingFollowId) return;
        setTogglingFollowId(targetUserId);
        try {
            if (isCurrentlyFollowing) {
                await unfollowUser(user.uid, targetUserId);
                setFollowingList(prev => prev.filter(u => u.uid !== targetUserId));
                toast({ title: "Unfollowed" });
            } else {
                await followUser(user.uid, targetUserId);
                const userToFollow = suggestedList.find(u => u.uid === targetUserId) || followersList.find(u => u.uid === targetUserId);
                if (userToFollow) {
                    setFollowingList(prev => [...prev, userToFollow]);
                }
                toast({ title: "Followed" });
            }
            // Manually update the suggested list to reflect the change
            setSuggestedList(prev => prev.filter(u => u.uid !== targetUserId));
        } catch (error) {
            console.error("Error following/unfollowing user:", error);
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setTogglingFollowId(null);
        }
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
        setIsScannerOpen(false);

        // Check for vCard
        if (decodedText.startsWith('BEGIN:VCARD')) {
            setScannedVCardData(decodedText);
            return;
        }

        // Check for app URL
        try {
            const url = new URL(decodedText);
            if (url.origin === window.location.origin && url.pathname.startsWith('/u/')) {
                router.push(url.pathname);
                toast({ title: "Profile Found!", description: "Redirecting to user profile..." });
                return;
            }
        } catch (error) {
            // Not a valid URL, do nothing and fall through to the error toast
        }

        toast({
            title: "Invalid QR Code",
            description: "Please scan a valid profile or contact QR code.",
            variant: "destructive",
        });
    };

    if (authLoading || isLoading) {
      return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
            <Tabs defaultValue="followers">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="followers">Followers</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>
                <TabsContent value="followers" className="flex flex-col gap-4">
                    <ConnectionCardSkeleton />
                    <ConnectionCardSkeleton />
                </TabsContent>
            </Tabs>
        </div>
      );
    }
    
    if (!user) return null; // Should be redirected by AuthProvider

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followers">Followers ({followersList.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({followingList.length})</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions ({suggestedList.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="followers">
              <div className="flex flex-col gap-4">
                  {followersList.map((followerUser) => {
                      const isFollowedByCurrentUser = followingList.some(f => f.uid === followerUser.uid);
                      const isProcessing = togglingFollowId === followerUser.uid;
                      return (
                      <Card key={followerUser.uid}>
                          <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                  <Link href={`/u/${followerUser.handle}`} className="flex items-center gap-4 hover:underline">
                                      <Avatar>
                                          <AvatarImage src={followerUser.avatarUrl} data-ai-hint="person portrait" />
                                          <AvatarFallback>{followerUser.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <p className="font-semibold">{followerUser.name}</p>
                                          <p className="text-sm text-muted-foreground">@{followerUser.handle}</p>
                                      </div>
                                  </Link>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                      <Button size="sm" variant={isFollowedByCurrentUser ? 'secondary' : 'default'} onClick={() => handleToggleFollow(followerUser.uid, isFollowedByCurrentUser)} disabled={isProcessing}>
                                          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFollowedByCurrentUser ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                          {isFollowedByCurrentUser ? 'Following' : 'Follow Back'}
                                      </Button>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  )})}
              </div>
          </TabsContent>
          <TabsContent value="following">
             <div className="flex flex-col gap-4">
                {followingList.map((followingUser) => {
                    const isProcessing = togglingFollowId === followingUser.uid;
                    return (
                        <Card key={followingUser.uid}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/u/${followingUser.handle}`} className="flex items-center gap-4 hover:underline">
                                        <Avatar>
                                            <AvatarImage src={followingUser.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{followingUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{followingUser.name}</p>
                                            <p className="text-sm text-muted-foreground">@{followingUser.handle}</p>
                                        </div>
                                    </Link>
                                    <Button size="sm" variant="secondary" onClick={() => handleToggleFollow(followingUser.uid, true)} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                        Unfollow
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </TabsContent>
        <TabsContent value="suggestions">
            <div className="grid md:grid-cols-2 gap-4">
                {suggestedList.map((suggestedUser) => {
                    const isProcessing = togglingFollowId === suggestedUser.uid;
                    return (
                        <Card key={suggestedUser.uid}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/u/${suggestedUser.handle}`} className="flex items-center gap-4 hover:underline flex-1 truncate">
                                        <Avatar>
                                            <AvatarImage src={suggestedUser.avatarUrl} data-ai-hint="person portrait" />
                                            <AvatarFallback>{suggestedUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{suggestedUser.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">@{suggestedUser.handle}</p>
                                        </div>
                                    </Link>
                                    <Button size="sm" variant="default" onClick={() => handleToggleFollow(suggestedUser.uid, false)} className="shrink-0" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                        Follow
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
