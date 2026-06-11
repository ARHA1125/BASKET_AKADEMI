"use client";

import { AutomationRule } from "@/types/rules";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createRule, deleteRule, getRules, updateRule } from "./rules";
import { deleteWahaSession, getWahaQR, getWahaStatus, sendWahaMessage, startWahaSession, stopWahaSession } from "./waha";


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

  const fetchQR = useCallback(async () => {
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
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const sessionData = await getWahaStatus();
      setSession(sessionData);
      const currentStatus = sessionData.status || "UNKNOWN";
      setStatus(currentStatus);

      if (currentStatus === "SCAN_QR_CODE") {
           fetchQR();
      } else {
          setQrCodeUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
      }
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
    }
  }, [fetchQR]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchStatus]); 

  const connect = async () => {
    console.log("useWahaStatus: connect() clicked and executing...");
    try {
        console.log("useWahaStatus: calling deleteWahaSession()...");
        await deleteWahaSession();
        console.log("useWahaStatus: calling startWahaSession()...");
        await startWahaSession();
        console.log("useWahaStatus: calling fetchStatus()...");
        fetchStatus();
    } catch (e) {
        console.error("useWahaStatus: connect() failed with error:", e);
        toast.error("Failed to start session cleanly");
    }
  };

  const disconnect = async () => {
    try {
        console.log("useWahaStatus: calling stopWahaSession()...");
        await stopWahaSession();
        fetchStatus();
    } catch (e) {
        console.error("useWahaStatus: disconnect() failed with error:", e);
        toast.error("Failed to stop session");
    }
  };

  const reset = async () => {
    console.log("useWahaStatus: reset() clicked and executing...");
    try {
        console.log("useWahaStatus: calling deleteWahaSession()...");
        await deleteWahaSession();
        console.log("useWahaStatus: calling fetchStatus()...");
        fetchStatus();
        toast.success("Session reset successfully");
    } catch (e) {
        console.error("useWahaStatus: reset() failed with error:", e);
        toast.error("Failed to reset session");
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
    reset,
    sendMessage,
    refreshStatus: fetchStatus
  };
}
