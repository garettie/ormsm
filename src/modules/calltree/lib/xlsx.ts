import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabase";
import type { Contact } from "../../types";

export async function parseSmsBlastFile(file: File): Promise<{ contacts: Partial<Contact>[]; earliestDate?: Date }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Find header row dynamically (look for "Reciever Name" in first 10 rows)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const row = raw[i] as string[];
    if (row && row.includes("Reciever Name")) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) throw new Error("Could not find header row with 'Reciever Name'");
  
  const headers = raw[headerIdx] as string[];
  const rows = raw.slice(headerIdx + 1);

  const nameIdx = headers.indexOf("Reciever Name");
  const phoneIdx = headers.indexOf("Reciever Contact No");
  const dateIdx = headers.indexOf("Create Datetime");

  if (nameIdx === -1 || phoneIdx === -1 || dateIdx === -1) {
    throw new Error("Missing required columns in file");
  }

  const parsedContacts: { name: string; number: string; date?: Date }[] = [];
  let earliestDate: Date | undefined = undefined;

  rows.forEach((row) => {
    const rawName = String(row[nameIdx] || "").trim();
    const rawPhone = String(row[phoneIdx] || "").trim();
    const rawDateValue = row[dateIdx];

    if (!rawName && !rawPhone) return;

    // Proper Case: CAPS LOCK -> Title Case
    const formattedName = rawName
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(" - ", " ");

    // Number normalization: -> 639... (Match MasterContacts format)
    let number = rawPhone.replace(/\D/g, ""); // Strip all non-digits
    if (number.startsWith("09")) {
      number = "63" + number.slice(1);
    } else if (number.startsWith("9") && number.length === 10) {
      number = "63" + number;
    }

    if (number.length >= 10) {
      const entry: Contact = { name: formattedName, number, department: "", location: "", position: "", date: undefined };
      
      let parsedDate: Date | null = null;
      if (rawDateValue instanceof Date) {
        parsedDate = rawDateValue;
      } else if (typeof rawDateValue === "string") {
        // Handle "2026-04-14 13:02:24.000"
        const d = new Date(rawDateValue.replace(" ", "T"));
        if (!isNaN(d.getTime())) parsedDate = d;
      }

      if (parsedDate) {
        entry.date = parsedDate;
        if (!earliestDate || parsedDate < earliestDate) earliestDate = parsedDate;
      }
      parsedContacts.push(entry);
    }
  });

  if (parsedContacts.length === 0) throw new Error("No valid contacts found in file");

  // Hydrate with MasterContacts - ONLY KEEP MATCHES
  const phoneList = Array.from(new Set(parsedContacts.map(c => c.number)));
  const { data: masterData, error: masterError } = await supabase
    .from("MasterContacts")
    .select("number, department, location, position, level")
    .in("number", phoneList);

  if (masterError) throw masterError;

  const hydrated: Partial<Contact>[] = parsedContacts
    .map(c => {
      const master = masterData?.find(m => m.number === c.number);
      if (!master) return null; // Drop if not in Master
      return {
        ...c,
        department: master.department,
        location: master.location,
        position: master.position,
        level: master.level
      } as Partial<Contact>;
    })
    .filter((c): c is Partial<Contact> => c !== null);

  if (hydrated.length === 0) throw new Error("None of the contacts match the Master Contacts list");

  return { contacts: hydrated, earliestDate };
}