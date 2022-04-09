import create from "zustand";
import { PullRequestType } from "./utils";

export const useStore = create((set: any) => ({
  hovered: null as PullRequestType | null,
  setHovered: (val: PullRequestType | null) => set(() => ({ hovered: val })),
}));
