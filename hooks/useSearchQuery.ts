"use client";
import { useSearchParams } from "next/navigation";

export default function useSearchQuery(
  paramName: string = "query",
  initialValue: string
): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const search = searchParams.get(paramName) || "";
  const setSearch = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(paramName, value);
    } else {
      newSearchParams.delete(paramName);
    }
  };
  setSearch(initialValue);
  return [search, setSearch];
}
