
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UrlTreePage() {

  const treeStyle = "pl-6 border-l-2 border-dashed border-muted-foreground/30 space-y-2";
  const itemStyle = "relative before:content-[''] before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2 before:w-5 before:h-[2px] before:bg-muted-foreground/30";
  const leafStyle = "text-primary font-mono";
  const groupStyle = "font-semibold";

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">Application URL Tree</h1>
            <p className="text-muted-foreground">A map of all the accessible routes in the application.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Core Authenticated Routes</CardTitle>
                <CardDescription>These pages are accessible to logged-in users and form the core application experience.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li><span className={leafStyle}>/</span> - Dashboard</li>
                    <li><span className={leafStyle}>/profile</span> - Profile Editor</li>
                    <li><span className={leafStyle}>/calendar</span> - My Content Hub</li>
                    <li><span className={leafStyle}>/holiday-scheduler</span> - AI Holiday Scheduler</li>
                    <li><span className={leafStyle}>/connections</span> - Connections Manager</li>
                    <li><span className={leafStyle}>/feed</span> - Status Feed</li>
                    <li><span className={leafStyle}>/notifications</span> - Notifications Page</li>
                    <li><span className={leafStyle}>/settings</span> - User Settings</li>
                    <li><span className={leafStyle}>/search</span> - Search Results</li>
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Public & Dynamic Routes</CardTitle>
                <CardDescription>These pages are publicly accessible and often display content based on the URL.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-2">
                    <li>
                        <span className={groupStyle}>/u/[username]</span> - Public User Profile
                        <ul className={treeStyle}>
                           <li className={itemStyle}><span className={leafStyle}>/card</span> - Digital Business Card</li>
                           <li className={itemStyle}><span className={leafStyle}>/links</span> - Link-in-Bio Page</li>
                        </ul>
                    </li>
                     <li><span className={leafStyle}>/explore</span> - Explore All Content</li>
                     <li><span className={leafStyle}>/whats-new</span> - "What's New" Page</li>
                     <li><span className={leafStyle}>/p/[promoId]</span> - Public Promo Page</li>
                     <li><span className={leafStyle}>/l/[listingId]</span> - Public Listing</li>
                     <li><span className={leafStyle}>/o/[opportunityId]</span> - Public Job/Opportunity</li>
                     <li><span className={leafStyle}>/offer/[offerId]</span> - Public Offer</li>
                     <li>
                        <span className={groupStyle}>/events/[eventId]</span> - Public Event
                        <ul className={treeStyle}>
                           <li className={itemStyle}><span className={leafStyle}>/register</span> - Event Registration Page</li>
                        </ul>
                    </li>
                </ul>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Content Creation & Editing Routes</CardTitle>
                <CardDescription>These authenticated routes are used for creating and editing user-generated content.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li>
                        <span className={groupStyle}>/promo</span>
                        <ul className={treeStyle}>
                            <li className={itemStyle}><span className={leafStyle}>/create</span> - Create New Promo Page</li>
                            <li className={itemStyle}><span className={leafStyle}>/[id]/edit</span> - Edit Promo Page</li>
                        </ul>
                    </li>
                    <li>
                        <span className={groupStyle}>/listings</span>
                        <ul className={treeStyle}>
                            <li className={itemStyle}><span className={leafStyle}>/create</span> - Create New Listing</li>
                            <li className={itemStyle}><span className={leafStyle}>/[id]/edit</span> - Edit Listing</li>
                        </ul>
                    </li>
                     <li>
                        <span className={groupStyle}>/opportunities</span>
                        <ul className={treeStyle}>
                            <li className={itemStyle}><span className={leafStyle}>/create</span> - Create New Job</li>
                            <li className={itemStyle}><span className={leafStyle}>/[id]/edit</span> - Edit Job</li>
                        </ul>
                    </li>
                     <li>
                        <span className={groupStyle}>/events</span>
                        <ul className={treeStyle}>
                            <li className={itemStyle}><span className={leafStyle}>/create</span> - Create New Event</li>
                            <li className={itemStyle}><span className={leafStyle}>/[id]/edit</span> - Edit Event</li>
                        </ul>
                    </li>
                     <li>
                        <span className={groupStyle}>/offers</span>
                        <ul className={treeStyle}>
                            <li className={itemStyle}><span className={leafStyle}>/create</span> - Create New Offer</li>
                            <li className={itemStyle}><span className={leafStyle}>/[id]/edit</span> - Edit Offer</li>
                        </ul>
                    </li>
                </ul>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Authentication Routes</CardTitle>
                <CardDescription>Routes for user sign-in, sign-up, and password management.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li><span className={leafStyle}>/auth/sign-in</span></li>
                    <li><span className={leafStyle}>/auth/sign-up</span></li>
                    <li><span className={leafStyle}>/auth/reset-password</span></li>
                </ul>
            </CardContent>
        </Card>
    </div>
  )
}
