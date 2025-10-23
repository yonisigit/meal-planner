export type GuestRankGuest = {
  id: string;
  name: string;
};

export type GuestRankedDish = {
  dishId: string;
  name: string;
  description?: string;
  rank: number | null;
};

export type GuestRankData = {
  guest: GuestRankGuest;
  hostName: string;
  dishes: GuestRankedDish[];
};

export type GuestRankSavingMap = Record<string, boolean>;
