"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuthEmailCooldown,
  type AuthEmailAction,
} from "@/lib/auth-action-cooldown";

export function useAuthEmailCooldown(action: AuthEmailAction) {
  const [remaining, setRemaining] = useState(() => getAuthEmailCooldown(action));
  const refresh = useCallback(() => {
    setRemaining(getAuthEmailCooldown(action));
  }, [action]);

  useEffect(() => {
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { refresh, remaining };
}
