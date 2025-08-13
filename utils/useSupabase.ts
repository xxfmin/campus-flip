import { PostgrestError } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseSupabaseOptions<T, P extends Record<string, string | number>> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseSupabaseReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams: P) => Promise<void>;
}

export const useSupabase = <T, P extends Record<string, string | number>>({
  fn,
  params = {} as P,
  skip = false,
}: UseSupabaseOptions<T, P>): UseSupabaseReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (fetchParams: P) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(fetchParams);
        setData(result);
      } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";

        // Handle Supabase-specific errors
        if (err && typeof err === "object" && "message" in err) {
          errorMessage = (err as PostgrestError).message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  useEffect(() => {
    if (!skip) {
      fetchData(params);
    }
  }, []);

  const refetch = async (newParams: P) => await fetchData(newParams);

  return { data, loading, error, refetch };
};
