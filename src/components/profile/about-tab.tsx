

'use client';

import type { User, PublicContentItem } from '@/lib/users';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, Linkedin, Mail, MapPin, Phone, Link as LinkIcon, Briefcase } from 'lucide-react';
import { linkIconData } from '@/lib/link-icons';
import { PublicContentCard } from '../public-content-card';
import { Button } from '../ui/button';
import { useAuth } from '../auth-provider';

interface AboutTabProps {
  user: User;
  contentOnly?: boolean;
  noContentMode?: 'posts' | 'gallery';
}

export function AboutTab({ user, contentOnly = false, noContentMode }: AboutTabProps) {
  const { user: currentUser } = useAuth();
  const { bio, hashtags, businessCard, links, otherContent } = user as User & { otherContent?: PublicContentItem[] };
  const hasBusinessCardInfo = businessCard && Object.values(businessCard).some(Boolean);

  if (contentOnly) {
      if (otherContent && otherContent.length > 0) {
          return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherContent.map(item => (
                      <PublicContentCard key={`${item.type}-${item.id}`} item={item} />
                  ))}
              </div>
          )
      } else {
          return (
              <Card className="text-center">
                  <CardContent className="p-10 text-muted-foreground flex flex-col items-center gap-4">
                      <Briefcase className="h-12 w-12" />
                      <h3 className="font-semibold text-foreground">No Content Yet</h3>
                      <p>This user hasn't created any public content like listings or events.</p>
                  </CardContent>
              </Card>
          )
      }
  }
  
  if (noContentMode === 'posts') {
    return (
        <Card className="text-center">
            <CardContent className="p-10 text-muted-foreground flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12" />
                <h3 className="font-semibold text-foreground">No Posts Yet</h3>
                <p>This user hasn't posted any status updates.</p>
                {currentUser?.uid === user.uid && (
                    <Button asChild><Link href="/feed">Create a Post</Link></Button>
                )}
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{bio || 'This user has not written a bio yet.'}</p>
            {hashtags && hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
                {hashtags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="lg:col-span-1 space-y-6">
        {hasBusinessCardInfo && (
            <Card>
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {businessCard?.title && <div className="flex items-start gap-3"><Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.title}{businessCard.company && `, ${businessCard.company}`}</span></div>}
                    {businessCard?.location && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.location}</span></div>}
                    {businessCard?.email && <a href={`mailto:${businessCard.email}`} className="flex items-start gap-3 hover:text-primary"><Mail className="h-4 w-4 mt-0.5 text-muted-foreground" /><span className="truncate">{businessCard.email}</span></a>}
                    {businessCard?.phone && <a href={`tel:${businessCard.phone}`} className="flex items-start gap-3 hover:text-primary"><Phone className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.phone}</span></a>}
                    {businessCard?.website && <a href={businessCard.website} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-primary"><Globe className="h-4 w-4 mt-0.5 text-muted-foreground" /><span className="truncate">{businessCard.website.replace(/^https?:\/\//, '')}</span></a>}
                    {businessCard?.linkedin && <a href={businessCard.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-primary"><Linkedin className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>LinkedIn Profile</span></a>}
                </CardContent>
            </Card>
        )}
         {links && links.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {links.map(link => {
                        const Icon = linkIconData[link.icon as keyof typeof linkIconData]?.icon || LinkIcon;
                        return (
                        <a key={link.id || link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{link.title}</span>
                            </Button>
                        </a>
                        )
                    })}
                </CardContent>
            </Card>
        )}
       </div>
    </div>
  );
}
