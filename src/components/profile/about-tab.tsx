
'use client';

import type { User } from '@/lib/users';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

interface AboutTabProps {
  user: User;
}

export function AboutTab({ user }: AboutTabProps) {
  const { bio, hashtags, businessCard } = user;
  const hasBusinessCardInfo = businessCard && Object.values(businessCard).some(Boolean);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{bio || 'This user has not written a bio yet.'}</p>
          </CardContent>
        </Card>

        {hashtags && hashtags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags & Interests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="md:col-span-1">
        {hasBusinessCardInfo && (
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {businessCard?.title && <div className="flex items-start gap-3"><Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.title}{businessCard.company && `, ${businessCard.company}`}</span></div>}
                    {businessCard?.location && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.location}</span></div>}
                    {businessCard?.email && <a href={`mailto:${businessCard.email}`} className="flex items-start gap-3 hover:text-primary"><Mail className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.email}</span></a>}
                    {businessCard?.phone && <a href={`tel:${businessCard.phone}`} className="flex items-start gap-3 hover:text-primary"><Phone className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{businessCard.phone}</span></a>}
                    {businessCard?.website && <a href={businessCard.website} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-primary"><Globe className="h-4 w-4 mt-0.5 text-muted-foreground" /><span className="truncate">{businessCard.website.replace(/^https?:\/\//, '')}</span></a>}
                    {businessCard?.linkedin && <a href={businessCard.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-primary"><Linkedin className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>LinkedIn Profile</span></a>}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
