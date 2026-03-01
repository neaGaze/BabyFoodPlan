import { getFoodStats } from "@/lib/actions/foods";
import { getBaby } from "@/lib/actions/babies";
import { FoodStats } from "@/components/statistics/food-stats";
import { redirect } from "next/navigation";

export default async function StatisticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: baby } = await getBaby(id);
  if (!baby) redirect("/dashboard");

  const { data: stats } = await getFoodStats(id);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <FoodStats foods={stats ?? []} babyId={id} />
    </div>
  );
}
