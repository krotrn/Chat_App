"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function useSearchQuery(
  paramName: string = "query",
  initialValue: string,
): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(
    searchParams.get(paramName) || initialValue,
  );

  useEffect(() => {
    const currentSearch = searchParams.get(paramName) || initialValue;
    setSearch(currentSearch);
  }, [searchParams, paramName, initialValue]);

  const updateSearch = useCallback(
    (value: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (value) {
        newSearchParams.set(paramName, value);
      } else {
        newSearchParams.delete(paramName);
      }
      router.push(`?${newSearchParams.toString()}`, { scroll: false });
      setSearch(value || "");
    },
    [router, searchParams, paramName],
  );

  return [search, updateSearch];
}
