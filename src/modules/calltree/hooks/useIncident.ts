import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { localNowAsUTC } from "../../../lib/utils";
import type { Incident, Contact } from "../types";

export function useIncident() {
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkActiveIncident = async () => {
    try {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .is("end_time", null)
        .maybeSingle();

      setActiveIncident(data);
    } catch (error) {
      console.error("Error checking incident:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkActiveIncident();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          checkActiveIncident();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startIncident = async (
    name: string,
    type: "test" | "actual",
    targetedContacts?: Partial<Contact>[],
    startTime?: string,
  ) => {
    const isTargeted = !!targetedContacts && targetedContacts.length > 0;
    const start_time = startTime || localNowAsUTC();

    const { data: incident, error } = await supabase
      .from("incidents")
      .insert({ name, type, start_time, is_targeted: isTargeted })
      .select()
      .single();

    if (error) {
      console.error("Error starting incident:", error);
      setError(error.message);
      return;
    }

    if (isTargeted && incident) {
      const eventContacts = targetedContacts.map((c) => ({
        incident_id: incident.id,
        name: c.name || "Unknown",
        number: c.number || "",
        department: c.department || "Unknown",
        location: c.location || "Unknown",
        position: c.position || "Unknown",
        level: c.level || "Unknown",
      }));

      const { error: contactError } = await supabase
        .from("event_contacts")
        .insert(eventContacts);

      if (contactError) {
        console.error("Error inserting event contacts:", contactError);
        setError("Failed to add some contacts");
      }
    }

    if (incident) setActiveIncident(incident);
  };

  const endIncident = async () => {
    if (!activeIncident) return;
    await supabase
      .from("incidents")
      .update({ end_time: localNowAsUTC() })
      .eq("id", activeIncident.id);
    setActiveIncident(null);
  };

  return { activeIncident, startIncident, endIncident, loading, error, setError };
}
