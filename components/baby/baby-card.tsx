import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Baby } from "@/lib/types/database";

export function BabyCard({ baby }: { baby: Baby }) {
  const age = getAge(baby.date_of_birth);

  return (
    <Link href={`/baby/${baby.id}`}>
      <Card className="hover:bg-pink-50/50 transition-colors cursor-pointer border-pink-200/40 shadow-sm shadow-pink-100/50">
        <CardHeader>
          <CardTitle>{"👶 "}{baby.name}</CardTitle>
          <CardDescription>{age}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function getAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 1) return "Newborn";
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} old`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0
    ? `${years}y ${rem}m old`
    : `${years} year${years > 1 ? "s" : ""} old`;
}
