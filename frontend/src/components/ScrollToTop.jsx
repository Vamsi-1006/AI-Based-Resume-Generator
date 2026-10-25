// import { useEffect } from "react";
// import { useLocation } from "react-router";

// export default function ScrollToTop() {
//   const { pathname } = useLocation();
//   useEffect(() => window.scrollTo(0, 0), [pathname]);
//   return null;
// }
import { useEffect } from "react";
import { useLocation } from "react-router";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Braces matter: the effect must return nothing (or a cleanup function).
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}