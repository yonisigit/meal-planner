import type { Guest } from "../types";
import { GuestRow } from "./GuestRow";
import { ListShell } from "./ListShell";

type GuestListProps = {
  guests: Guest[];
  loading: boolean;
  error: string | null;
};

export function GuestList({ guests, loading, error }: GuestListProps) {
  if (loading) {
    return <ListShell>Loading guests...</ListShell>;
  }

  if (error) {
    return <ListShell error>{error}</ListShell>;
  }

  if (!guests || guests.length === 0) {
    return <ListShell>No guests yet. Start by adding the people you host most often.</ListShell>;
  }

  return (
    <ListShell>
      <ul className="divide-y divide-[#f5d8b4]/70">
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} />
        ))}
      </ul>
    </ListShell>
  );
}
