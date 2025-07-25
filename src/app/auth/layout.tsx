import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-dot p-4">
      <div className="w-full max-w-sm space-y-6">
        <Logo className="justify-center text-2xl" />
        {children}
      </div>
    </div>
  );
}
