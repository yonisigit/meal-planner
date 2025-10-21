import type { AxiosResponse } from "axios";
import api from "../../../lib/axios";
import type { Dish, DishCategory } from "../types";

export async function fetchDishes(): Promise<Dish[]> {
  const response: AxiosResponse<Dish[] | undefined> = await api.get("/dishes");
  if (!Array.isArray(response.data)) {
    return [];
  }
  return response.data;
}

export async function createDish(payload: { name: string; description?: string; category: DishCategory }) {
  const response = await api.post("/dishes", payload);
  return response.data;
}
