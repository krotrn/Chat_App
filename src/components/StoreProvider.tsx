"use client";

import { AppStore, makeStore } from "@/lib/redux/store";
import { useRef } from "react";
import { Provider } from "react-redux";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
