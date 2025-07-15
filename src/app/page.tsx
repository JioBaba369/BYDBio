
"use client"

import { useAuth } from "@/components/auth-provider"
import { LandingPage } from "@/components/landing-page"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import Dashboard from "./dashboard/page"

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
