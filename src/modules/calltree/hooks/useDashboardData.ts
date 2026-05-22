import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { STATUS_MAPPING } from "../lib/constants";
import type {
  Contact,
  Response,
  DashboardData,
  ProcessedContact,
  Status,
  PollOption,
} from "../types";

const cleanNumber = (num: string | number): string => {
  if (!num) return "";
  return String(num).replace(/[\s\-+()]/g, "");
};

const parseSeverityResponse = (content: string): { status: Status; name: string } => {
  if (!content) return { status: "No Response", name: "" };

  const tokens = content.trim().split(/[\s,-]+/);
  let foundStatus: Status | null = null;
  let statusIndex = -1;

  for (let i = 0; i < tokens.length; i++) {
    const cleanToken = tokens[i].replace(/[^\w\s]/g, "").toLowerCase();

    if (STATUS_MAPPING[cleanToken]) {
      foundStatus = STATUS_MAPPING[cleanToken];
      statusIndex = i;
      break;
    }
  }

  if (foundStatus !== null && statusIndex !== -1) {
    const nameTokens = [...tokens];
    nameTokens.splice(statusIndex, 1);
    let name = nameTokens.join(" ");
    name = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
    return { status: foundStatus, name };
  }

  return { status: "No Response", name: content.trim() };
};

const parseBroadcastResponse = (content: string): { status: Status; name: string } => {
  if (!content) return { status: "No Response", name: "" };
  return { status: "Responded", name: content.trim() };
};

const parsePollResponse = (
  content: string,
  pollOptions: PollOption[],
): { status: Status; name: string } => {
  if (!content) return { status: "No Response", name: "" };

  const tokens = content.trim().split(/[\s,-]+/);

  for (const token of tokens) {
    const clean = token.replace(/[^\w\s]/g, "").toLowerCase();
    const match = pollOptions.find(
      (o) => o.code.toLowerCase() === clean,
    );
    if (match) {
      const name = content.trim().replace(token, "").replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      return { status: match.label, name };
    }
  }

  return { status: "Invalid", name: content.trim() };
};

const findNameInReply = (
  reply: string,
  contacts: ProcessedContact[],
): ProcessedContact | null => {
  if (!reply || reply.length < 2) return null;

  const replyTokens = reply
    .toLowerCase()
    .split(/[\s,-]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 0);
  if (replyTokens.length === 0) return null;

  const matches = contacts.filter((contact) => {
    const nameTokens = contact.name
      .toLowerCase()
      .split(/[\s,-]+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ""))
      .filter((t) => t.length > 0);

    return nameTokens.every((nameToken) => {
      if (nameToken.length === 1) return true;
      return replyTokens.some((replyToken) => replyToken.startsWith(nameToken));
    });
  });

  if (matches.length > 1) {
    console.warn(
      `Ambiguous name match for reply "${reply}". Found ${matches.length} contacts.`,
    );
    return null;
  }

  return matches.length === 1 ? matches[0] : null;
};

const findContactByName = (
  searchName: string,
  contacts: ProcessedContact[],
): ProcessedContact | null => {
  if (!searchName || searchName.length < 2) return null;

  const searchTokens = searchName
    .toLowerCase()
    .split(/[\s,-]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 0);
  if (searchTokens.length === 0) return null;

  const matches = contacts.filter((contact) => {
    const contactNameParts = contact.name
      .toLowerCase()
      .split(/[\s,-]+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ""));

    return searchTokens.every((sToken) => {
      return contactNameParts.some((cToken) => {
        if (sToken.length === 1) return true;
        return cToken.startsWith(sToken);
      });
    });
  });

  if (matches.length > 1) {
    console.warn(
      `Ambiguous name match for "${searchName}". Found ${matches.length} contacts.`,
    );
    return null;
  }

  return matches.length === 1 ? matches[0] : null;
};

export const useDashboardData = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<DashboardData>({
    contacts: [],
    unknownResponses: [],
    lastUpdated: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (options?: { background?: boolean }) => {
      try {
        if (!options?.background) {
          setLoading(true);
        }
        setError(null);

        const fetchAll = async (
          table: string,
          orderBy?: string,
          minDate?: string,
          maxDate?: string,
        ): Promise<Record<string, unknown>[]> => {
          let allData: Record<string, unknown>[] = [];
          let from = 0;
          const step = 1000;
          while (true) {
            let query = supabase.from(table).select("*");

            if (orderBy) {
              query = query.order(orderBy, { ascending: false });
            }

            if (minDate) {
              query = query.gte("datetime", minDate);
            }
            if (maxDate) {
              query = query.lte("datetime", maxDate);
            }

            const { data, error } = await query.range(from, from + step - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;
            allData = [...allData, ...data];
            if (data.length < step) break;
            from += step;
          }
          return allData;
        };

        const [activeIncidentData, pastIncidentData, contactsData, responsesData, altNumbersData] = await Promise.all([
          supabase.from("incidents").select("*").is("end_time", null).maybeSingle(),
          startDate ? supabase.from("incidents").select("*").eq("start_time", startDate).maybeSingle() : Promise.resolve({ data: null }),
          fetchAll("MasterContacts"),
          fetchAll("Responses", "datetime", startDate, endDate),
          supabase.from("ContactAltNumbers").select("*"),
        ]);

        const incident = activeIncidentData.data || pastIncidentData.data;
        const notificationCategory: "emergency" | "broadcast" | "poll" =
          (incident?.notification_category as "emergency" | "broadcast" | "poll") || "emergency";
        const pollOptions: PollOption[] | undefined = incident?.poll_options as PollOption[] | undefined;
        let contacts: Contact[] = [];

        if (incident?.is_targeted) {
          const { data: eventContacts, error: ecError } = await supabase
            .from("event_contacts")
            .select("*")
            .eq("incident_id", incident.id);
          
          if (ecError) throw ecError;
          contacts = (eventContacts || []) as unknown as Contact[];
        } else {
          contacts = (contactsData || []) as unknown as Contact[];
        }

        const responses = (responsesData || []) as unknown as Response[];

        const parseResponse =
          notificationCategory === "broadcast"
            ? parseBroadcastResponse
            : notificationCategory === "poll"
            ? (content: string) => parsePollResponse(content, pollOptions || [])
            : parseSeverityResponse;

        const processedContacts: ProcessedContact[] = contacts.map((c) => ({
          ...c,
          cleanNumber: cleanNumber(c.number),
          status: "No Response",
        }));

        const knownNumbers = new Set(
          processedContacts.map((c) => c.cleanNumber),
        );

        const altNumberMap = new Map<string, string>();
        const altNumbers = (altNumbersData.data || []) as { contact_id: string; number: string }[];
        for (const alt of altNumbers) {
          const contact = processedContacts.find((c) => c.cleanNumber === alt.contact_id);
          if (contact) {
            altNumberMap.set(cleanNumber(alt.number), contact.cleanNumber);
          }
        }

        const unknownResponses: Response[] = [];
        const responseMap = new Map<string, Response>();
        const altNumbersToSave: { contact_id: string; contact_name: string; number: string; source_response_id: string | null }[] = [];

        responses.forEach((r) => {
          const cleanParams = cleanNumber(r.contact);
          const { status, name } = parseResponse(r.contents);
          let matchedContactCleanNumber: string | null = null;
          let matchType: "phone" | "name" | "manual" | "alt-phone" | undefined = undefined;

          // 1. Try name match FIRST (handles co-worker replies with typed name)
          if (name && status !== "No Response") {
            const matchedContact = notificationCategory === "broadcast"
              ? findNameInReply(name, processedContacts)
              : findContactByName(name, processedContacts);
            if (matchedContact) {
              matchedContactCleanNumber = matchedContact.cleanNumber;
              matchType = "name";
              // Auto-save alt number only if the replying number is unknown —
              // meaning it's likely their own alt number, not a co-worker's phone
              const isUnknownNumber = !knownNumbers.has(cleanParams) && !altNumberMap.has(cleanParams);
              if (isUnknownNumber) {
                altNumbersToSave.push({
                  contact_id: matchedContact.cleanNumber,
                  contact_name: matchedContact.name,
                  number: r.contact,
                  source_response_id: r.uid ?? null,
                });
                // Optimistically update local map so subsequent responses from same number also match
                altNumberMap.set(cleanParams, matchedContact.cleanNumber);
              }
            }
          }

          // 2. If no name match, try phone match
          if (!matchedContactCleanNumber && knownNumbers.has(cleanParams)) {
            matchedContactCleanNumber = cleanParams;
            matchType = "phone";
          }

          // 3. If no primary phone match, try alt number match
          if (!matchedContactCleanNumber && altNumberMap.has(cleanParams)) {
            matchedContactCleanNumber = altNumberMap.get(cleanParams)!;
            matchType = "alt-phone";
          }

          if (r.contents.toLowerCase().includes("manual entry")) {
            matchType = "manual";
          }

          if (matchedContactCleanNumber) {
            if (!responseMap.has(matchedContactCleanNumber)) {
              const boostedResponse = { ...r, matchType } as Response & {
                matchType: "phone" | "name" | "manual" | "alt-phone";
              };
              responseMap.set(matchedContactCleanNumber, boostedResponse);
            }
          } else {
            unknownResponses.push(r);
          }
        });

        // Fire-and-forget: save newly discovered alt numbers (name-matched from unknown number)
        // Upsert on number column to avoid duplicate errors on repeated fetches
        if (altNumbersToSave.length > 0) {
          supabase.from("ContactAltNumbers")
            .upsert(altNumbersToSave, { onConflict: "number" })
            .then(({ error }) => {
              if (error) console.warn("Failed to auto-save alt numbers:", error.message);
            });
        }

        processedContacts.forEach((c) => {
          const resp = responseMap.get(c.cleanNumber) as
            | (Response & { matchType?: "phone" | "name" | "manual" | "alt-phone" })
            | undefined;
          if (resp) {
            const { status } = parseResponse(resp.contents);
            c.status = status;
            c.responseContent = resp.contents;
            c.rawResponse = resp.contents;
            c.responseTime = resp.datetime;
            c.matchType = resp.matchType;
          }
        });

        unknownResponses.sort((a, b) => {
          const aHasName = parseResponse(a.contents).name ? 1 : 0;
          const bHasName = parseResponse(b.contents).name ? 1 : 0;
          return bHasName - aHasName;
        });

        setData({
          contacts: processedContacts,
          unknownResponses,
          lastUpdated: new Date(),
          isTargeted: !!incident?.is_targeted,
          notificationCategory,
          pollOptions,
        });
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        if (!options?.background) {
          setLoading(false);
        }
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData({ background: true });
      }
    }, 60000); // Auto-refresh every 60s when visible

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData({ background: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};
