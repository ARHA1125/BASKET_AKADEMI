"use client";

import { AutomationRule } from "@/types/rules";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createRule, deleteRule, getRules, updateRule } from "./rules";
import { getWahaQR, getWahaStatus, sendWahaMessage, startWahaSession, stopWahaSession } from "./waha";


export function useAutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setRules(data);
    } catch (error) {
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const addRule = async (rule: Partial<AutomationRule>) => {
    try {
      await createRule(rule);
      toast.success("Rule created successfully");
      fetchRules();
      return true;
    } catch (error) {
      toast.error("Failed to save rule");
      return false;
    }
  };

  const toggleRuleActive = async (id: string, isActive: boolean) => {
    try {
      await updateRule(id, { isActive });
      fetchRules();
      toast.success(`Rule ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update rule");
    }
  };

  const removeRule = async (id: string) => {
    try {
      await deleteRule(id);
      toast.success("Rule deleted");
      fetchRules();
    } catch (error) {
      toast.error("Failed to delete rule");
    }
  };

  return {
    rules,
    loading,
    refreshRules: fetchRules,
    addRule,
    toggleRuleActive,
    removeRule
  };
}


export function useWahaStatus(pollInterval = 5000) {
  const [status, setStatus] = useState<string>("LOADING");
  const [session, setSession] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const sessionData = await getWahaStatus();
      setSession(sessionData);
      const currentStatus = sessionData.status || "UNKNOWN";
      setStatus(currentStatus);

      if (currentStatus === "SCAN_QR_CODE") {
           fetchQR();
      } else {
          if (qrCodeUrl) {
            URL.revokeObjectURL(qrCodeUrl);
            setQrCodeUrl(null);
          }
      }
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
    }
  }, [qrCodeUrl]);

  const fetchQR = async () => {
      try {
          const blob = await getWahaQR();
          const url = URL.createObjectURL(blob);
          setQrCodeUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
      } catch (e) {
          console.error("Failed to fetch QR", e);
      }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchStatus]); 

  const connect = async () => {
    try {
        await startWahaSession();
        fetchStatus();
    } catch (e) {
        console.error(e);
        toast.error("Failed to start session");
    }
  };

  const disconnect = async () => {
    try {
        await stopWahaSession();
        fetchStatus();
    } catch (e) {
        console.error(e);
        toast.error("Failed to stop session");
    }
  };

  const sendMessage = async (phone: string, msg: string) => {
      try {
          let chatId = phone;
          if (!chatId.includes('@')) chatId = `${chatId}@c.us`;
          await sendWahaMessage(chatId, msg);
          toast.success("Message sent!");
          return true;
      } catch (e: any) {
          toast.error("Failed: " + (e.message || e));
          return false;
      }
  };

  return {
    status,
    session,
    qrCodeUrl,
    connect,
    disconnect,
    sendMessage,
    refreshStatus: fetchStatus
  };
}
