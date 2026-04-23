import { useState, useCallback, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export enum TemplateType {
  INVOICE = 'INVOICE',
  REMINDER = 'REMINDER',
  ACCEPTANCE = 'ACCEPTANCE',
  EVENT = 'EVENT',
  CUSTOM = 'CUSTOM',
  BROADCAST = 'BROADCAST',
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: TemplateType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/message-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (payload: Partial<MessageTemplate>) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/message-templates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ...payload, type: payload.type || TemplateType.CUSTOM })
      });
      if (res.ok) {
        await fetchTemplates();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create template:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, payload: Partial<MessageTemplate>) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/message-templates/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchTemplates();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update template:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/message-templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchTemplates();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
