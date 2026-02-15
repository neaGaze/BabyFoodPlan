import { getBabies } from "@/lib/actions/babies";
import { BabyCard } from "@/components/baby/baby-card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { data: babies } = await getBabies();

  // Auto-redirect if single baby
  if (babies && babies.length === 1) {
    redirect(`/baby/${babies[0].id}`);
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Babies</h1>
        <form action={signOut}>
          <Button variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <div className="grid gap-4">
        {babies?.map((baby) => <BabyCard key={baby.id} baby={baby} />)}

        {(!babies || babies.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No babies yet. Add one to get started!
          </p>
        )}
      </div>

      <div className="mt-6">
        <Link href="/baby/new">
          <Button className="w-full">Add baby</Button>
        </Link>
      </div>
    </div>
  );
}
