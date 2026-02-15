import { CreateBabyForm } from "@/components/baby/create-baby-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewBabyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            &larr; Back
          </Button>
        </Link>
      </div>
      <CreateBabyForm />
    </div>
  );
}
