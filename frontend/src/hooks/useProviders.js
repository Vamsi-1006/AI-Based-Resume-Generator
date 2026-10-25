import { useEffect, useState } from "react";
import { getProviders } from "../api/ResumeService";

const KEY = "airesume.provider";

/** Loads the LLM providers from the backend and remembers the user's choice. */
export default function useProviders() {
  const [providers, setProviders] = useState([]);
  const [provider, setProviderState] = useState(() => localStorage.getItem(KEY) || "");
  const [backendUp, setBackendUp] = useState(true);

  useEffect(() => {
    getProviders()
      .then((list) => {
        setProviders(list);
        setBackendUp(true);
      })
      .catch(() => setBackendUp(false));
  }, []);

  const setProvider = (p) => {
    setProviderState(p);
    localStorage.setItem(KEY, p);
  };

  return { providers, provider, setProvider, backendUp };
}
