import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GuestRankForm } from "../features/guests/rank/components/GuestRankForm";
import { GuestRankShell } from "../features/guests/rank/components/GuestRankShell";
import { GuestRankStatusCard } from "../features/guests/rank/components/GuestRankStatusCard";
import { useGuestRank } from "../features/guests/rank/hooks/useGuestRank";

const GuestRankPage = () => {
  const { rankToken } = useParams<{ rankToken: string }>();
  const [isDone, setIsDone] = useState(false);
  const { data, loading, error, refresh, saveRank, savingMap } = useGuestRank(rankToken);

  useEffect(() => {
    setIsDone(false);
  }, [data?.guest.id]);

  const handleRankChange = (dishId: string, rank: number) => {
    if (rank < 1 || rank > 3) {
      return;
    }
    void saveRank(dishId, rank);
  };

  return (
    <GuestRankShell>
      {loading ? (
        <GuestRankStatusCard title="One moment…" message="Loading dishes..." />
      ) : error || !data ? (
        <GuestRankStatusCard
          title="Oops!"
          message={error ?? "We could not find any dishes to rank for this link."}
          tone="error"
          action={rankToken ? { label: "Try again", onClick: () => void refresh() } : undefined}
        />
      ) : isDone ? (
        <GuestRankStatusCard
          title="Thank you!"
          message="Your preferences are saved. You can return to the ranking page anytime using this link."
          action={{ label: "Back to rankings", onClick: () => setIsDone(false) }}
        />
      ) : (
        <GuestRankForm
          data={data}
          savingMap={savingMap}
          onRankChange={handleRankChange}
          onDone={() => setIsDone(true)}
        />
      )}
    </GuestRankShell>
  );
};

export default GuestRankPage;
