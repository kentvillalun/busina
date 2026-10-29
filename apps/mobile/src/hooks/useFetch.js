import { useEffect, useState } from "react";

// Same idea as useFetch in Ecoaid: GET a url and give back { isLoading, isError, data, error }.
// Change `refetchCount` to fetch again (the home screen bumps it every few seconds).
// `errorCount` is how many requests failed in a row (back to 0 after a success), so the screen
// can stop asking a server that is down.
const useFetch = ({ url, refetchCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          setError("There is an error fetching data");
          setIsError(true);
          setErrorCount((count) => count + 1);
          return;
        }

        setData(result);
        setErrorCount(0);
      } catch {
        setError("Fetching failed");
        setIsError(true);
        setErrorCount((count) => count + 1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, refetchCount]);

  return { isLoading, isError, errorCount, data, error };
};

export { useFetch };
