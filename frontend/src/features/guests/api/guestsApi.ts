import type { AxiosResponse } from "axios";
import api from "../../../lib/axios";
import type { GuestDishRank } from "../../meals/types";
import type { Guest } from "../types";

export async function fetchGuests(): Promise<Guest[]> {
  const response: AxiosResponse<Guest[] | undefined> = await api.get("/guests");
  if (!Array.isArray(response.data)) {
    return [];
  }
  return response.data;
}

export async function createGuest(payload: { name: string }): Promise<Guest> {
  const response: AxiosResponse<Guest> = await api.post("/guests", payload);
  return response.data;
}

export async function fetchGuestDishes(guestId: string): Promise<GuestDishRank[]> {
  const response: AxiosResponse<GuestDishRank[] | undefined> = await api.get(
    `/guests/${encodeURIComponent(guestId)}/dishes`,
  );
  if (!Array.isArray(response.data)) {
    return [];
  }
  return response.data;
}

export async function saveGuestDishRank(guestId: string, dishId: string, rank: number | null) {
  const response = await api.post(
    `/guests/${encodeURIComponent(guestId)}/dishes/${encodeURIComponent(dishId)}`,
    { rank },
  );
  return response.data;
}
