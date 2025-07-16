
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search as SearchIcon, QrCode, UserCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "@/components/qr-scanner";
import Link from "next/link";
import { saveAs } from "file-saver";
import { useAuth } from "@/components/auth-provider";
import type { User } from "@/lib/users";
import { getFollowers, getFollowing, getSuggestedUsers } from "@/lib/connections";
import { ConnectionsPageSkeleton } from "@/components/connections-skeleton";
import { FollowButton } from "@/components/follow-button";


export default function ConnectionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const validTabs = ['followers', 'following', 'suggestions'];
    const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'followers';
    
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [followersList, setFollowersList] = useState<User[]>([]);
    const [followingList, setFollowingList] = useState<User[]>([]);
    const [suggestedList, setSuggestedList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedVCardData, setScannedVCardData] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchConnections = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [followers, following, suggested] = await Promise.all([
                getFollowers(user.uid),
                getFollowing(user.uid),
                getSuggestedUsers(user.uid)
            ]);
            setFollowersList(followers);
            setFollowingList(following);
            setSuggestedList(suggested);
        } catch (error) {
            toast({ title: "Error fetching connections", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user?.uid) {
            fetchConnections();
        }
    }, [user?.uid, fetchConnections]);

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

        if (decodedText.startsWith('BEGIN:VCARD')) {
            setScannedVCardData(decodedText);
            return;
        }

        try {
            const url = new URL(decodedText);
            if (url.origin === window.location.origin && url.pathname.startsWith('/u/')) {
                router.push(url.pathname);
                toast({ title: "Profile Found!", description: "Redirecting to user profile..." });
                return;
            }
        } catch (error) {
            // Not a valid URL
        }

        toast({
            title: "Invalid QR Code",
            description: "Please scan a valid profile or contact QR code.",
            variant: "destructive",
        });
    };
    
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/connections?tab=${value}`, { scroll: false });
    };

    if (authLoading || isLoading) {
      return <ConnectionsPageSkeleton />;
    }
    
    if (!user) return null;

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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="followers">Followers ({followersList.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({followingList.length})</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions ({suggestedList.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="followers" className="pt-4">
              {followersList.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {followersList.map((followerUser) => {
                        const isFollowedByCurrentUser = user.following.includes(followerUser.uid);
                        return (
                        <Card key={followerUser.uid}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/u/${followerUser.username}`} className="flex items-center gap-4 hover:underline">
                                        <Avatar>
                                            <AvatarImage src={followerUser.avatarUrl} />
                                            <AvatarFallback>{followerUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{followerUser.name}</p>
                                            <p className="text-sm text-muted-foreground">@{followerUser.username}</p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <FollowButton targetUserId={followerUser.uid} initialIsFollowing={isFollowedByCurrentUser} initialFollowerCount={followerUser.followerCount} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )})}
                </div>
              ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <Users className="h-12 w-12" />
                        <h3 className="font-semibold text-foreground">No Followers Yet</h3>
                        <p>When other users follow you, they'll appear here.</p>
                    </CardContent>
                </Card>
              )}
          </TabsContent>
          <TabsContent value="following" className="pt-4">
            {followingList.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {followingList.map((followingUser) => (
                        <Card key={followingUser.uid}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/u/${followingUser.username}`} className="flex items-center gap-4 hover:underline">
                                        <Avatar>
                                            <AvatarImage src={followingUser.avatarUrl} />
                                            <AvatarFallback>{followingUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{followingUser.name}</p>
                                            <p className="text-sm text-muted-foreground">@{followingUser.username}</p>
                                        </div>
                                    </Link>
                                    <FollowButton targetUserId={followingUser.uid} initialIsFollowing={true} initialFollowerCount={followingUser.followerCount} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <SearchIcon className="h-12 w-12" />
                        <h3 className="font-semibold text-foreground">Start Connecting</h3>
                        <p>You aren't following anyone yet. Explore suggestions to get started.</p>
                         <Button asChild>
                            <Link href="/connections?tab=suggestions">Find People to Follow</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="suggestions" className="pt-4">
            {suggestedList.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {suggestedList.map((suggestedUser) => (
                        <Card key={suggestedUser.uid}>
                            <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                                <Link href={`/u/${suggestedUser.username}`} className="hover:underline">
                                    <Avatar className="h-20 w-20 mb-2">
                                        <AvatarImage src={suggestedUser.avatarUrl} />
                                        <AvatarFallback>{suggestedUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold">{suggestedUser.name}</p>
                                    <p className="text-sm text-muted-foreground">@{suggestedUser.username}</p>
                                </Link>
                                <p className="text-sm text-muted-foreground text-center line-clamp-2 h-10 mt-2">
                                    {suggestedUser.bio}
                                </p>
                                <FollowButton targetUserId={suggestedUser.uid} initialIsFollowing={false} initialFollowerCount={suggestedUser.followerCount} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
             ) : (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <UserCheck className="h-12 w-12" />
                        <h3 className="font-semibold text-foreground">All Caught Up</h3>
                        <p>There are no new suggestions right now. Check back later!</p>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
