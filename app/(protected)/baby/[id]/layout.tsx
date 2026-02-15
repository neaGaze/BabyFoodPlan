import { getBaby } from "@/lib/actions/babies";
import { BabyHeader } from "@/components/baby/baby-header";
import { redirect } from "next/navigation";

export default async function BabyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: baby } = await getBaby(id);
  if (!baby) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <BabyHeader baby={baby} />
      {children}
    </div>
  );
}
