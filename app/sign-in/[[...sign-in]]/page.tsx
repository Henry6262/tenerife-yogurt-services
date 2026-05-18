import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-lg border border-slate-200 rounded-2xl",
            headerTitle: "text-xl font-bold text-slate-900",
            headerSubtitle: "text-sm text-slate-500",
            formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700",
            footerActionLink: "text-emerald-600 hover:text-emerald-700",
          },
        }}
      />
    </div>
  );
}
