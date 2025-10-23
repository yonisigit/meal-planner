import api from "../../../../lib/axios";
import type { GuestRankData, GuestRankedDish } from "../types";

type GuestRankApiDish = {
  dishId?: string | null;
  dish_id?: string | null;
  name: string;
  description?: string | null;
  rank: number | null;
};

type GuestRankApiResponse = {
  guest: {
    id: string;
    name: string;
  };
  hostName?: string | null;
  dishes: GuestRankApiDish[];
};

const mapDish = (dish: GuestRankApiDish): GuestRankedDish => {
  const dishId = dish.dishId ?? dish.dish_id;
  if (!dishId) {
    throw new Error("Dish is missing an id");
  }
  return {
    dishId,
    name: dish.name,
    description: dish.description ?? undefined,
    rank: typeof dish.rank === "number" ? dish.rank : null,
  };
};

const mapResponse = (data: GuestRankApiResponse): GuestRankData => {
  return {
    guest: {
      id: data.guest.id,
      name: data.guest.name,
    },
    hostName: data.hostName?.trim?.() || "Your host",
    dishes: Array.isArray(data.dishes) ? data.dishes.map(mapDish) : [],
  };
};

export async function fetchGuestRankData(rankToken: string): Promise<GuestRankData> {
  const response = await api.get<GuestRankApiResponse>(`/guests/token/${encodeURIComponent(rankToken)}`);
  return mapResponse(response.data);
}

export async function saveGuestRankSelection(rankToken: string, dishId: string, rank: number): Promise<void> {
  await api.post(`/guests/token/${encodeURIComponent(rankToken)}/dishes/${encodeURIComponent(dishId)}`, {
    rank,
  });
}
