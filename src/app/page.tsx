
"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { LandingPage } from "@/components/landing-page"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import Dashboard from "./dashboard/page"

export default function HomePage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // This effect handles the initial authentication check.
    // The main logic for redirection is handled within the AuthProvider.
  }, [loading, user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
