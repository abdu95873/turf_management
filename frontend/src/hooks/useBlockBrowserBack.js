import { useEffect } from "react";

/**
 * Keeps the user on payment result pages — browser Back won't return to SSLCommerz
 * or the gateway redirect chain.
 */
export default function useBlockBrowserBack() {
  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    blockBack();
    window.addEventListener("popstate", blockBack);
    return () => window.removeEventListener("popstate", blockBack);
  }, []);
}
