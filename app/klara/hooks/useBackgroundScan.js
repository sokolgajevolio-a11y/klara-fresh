import { useEffect } from "react";
import { backgroundScan } from "../scans/backgroundScan";
import { useKlaraContext } from "../sidebar/KlaraContextProvider";

export function useBackgroundScan({ resourceType, data }) {
  const { setFindings, setMessages } = useKlaraContext();

  useEffect(() => {
    if (!data) return;

    const results = backgroundScan({ resourceType, data });
    setFindings(results);

    if (results.length > 0) {
      setMessages(["Scan complete. Issues found."]);
    } else {
      setMessages(["Scan complete. No issues found."]);
    }
  }, [resourceType, data]);
}
