import { useEffect } from "react";
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  multiply: (multiplier: number) => void;
  add: (a: number) => void;
  subtract: (a: number) => void;
  divide: (a: number) => void;
}

export const counterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  multiply: (multiplier: number) => set((state) => ({ count: state.count * multiplier })),
  add: (a: number) => set((state) => ({ count: state.count + a })),
  subtract: (a: number) => set((state) => ({ count: state.count - a })),
  divide: (a: number) => {
    if (a === 0) {
      console.error("Cannot divide by zero");
      return;
    }
    set((state) => ({ count: state.count / a }));
  },
}));


export const useExtendedCounterStore = () => {
  const { count, increment, decrement, reset, multiply, add, subtract, divide    } = counterStore();

  useEffect(() => {
    console.log("count", count);
  }, [count]);

  return { count, increment, decrement, reset, multiply, add, subtract, divide };
};
