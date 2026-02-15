import { getFoodLibrary } from "@/lib/actions/foods";
import { FoodCalendar } from "@/components/calendar/food-calendar";

export default async function BabyCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: foods } = await getFoodLibrary(id);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <FoodCalendar babyId={id} foods={foods ?? []} />
    </div>
  );
}
