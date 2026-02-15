import { getFoodLibrary } from "@/lib/actions/foods";
import { getBaby } from "@/lib/actions/babies";
import { FoodLibrary } from "@/components/food/food-library";
import { redirect } from "next/navigation";

export default async function FoodsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: baby } = await getBaby(id);
  if (!baby) redirect("/dashboard");

  const { data: foods } = await getFoodLibrary(id);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <FoodLibrary foods={foods ?? []} babyId={id} />
    </div>
  );
}
