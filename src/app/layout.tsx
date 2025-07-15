import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { AppLayout } from '@/components/app-layout';
import { Inter, Poppins } from 'next/font/google'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'BYD.Bio - Build Your Dream Bio',
  description: 'Build Your Dream Bio. Your professional hub for profiles, links, and opportunities.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased min-h-screen bg-background', fontSans.variable, fontHeadline.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
