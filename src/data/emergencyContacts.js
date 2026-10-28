/* ------------------------------------------------------------------
   Emergency data used by the trip PDF  (put this file in src/data/)

   1. NATIONAL_CONTACTS  - nationwide helplines.
   2. DISTRICT_CONTACTS  - Ratnagiri control rooms. Taken from ratnagiri.gov.in
                           (checked October 2026). Re-check once a year.
   3. FACILITIES         - hospitals and police stations. THIS IS THE LIST YOU
                           GROW. Only add numbers you have verified yourself
                           (call them, or copy from the official site).
   4. EMERGENCY_STEPS    - plain-language "what to do" guidance.
------------------------------------------------------------------- */

export const NATIONAL_CONTACTS = [
  ["All emergencies (police, fire, medical)", "112"],
  ["Police", "100"],
  ["Fire", "101"],
  ["Ambulance (Maharashtra emergency service)", "108"],
  ["Women helpline", "1091"],
  ["Child helpline", "1098"],
  ["Highway helpline (NHAI)", "1033"],
  ["Tourist helpline", "1363"],
];

export const DISTRICT_CONTACTS = [
  ["Ratnagiri Police HQ control room", "02352-222222"],
  ["Collector office control room", "02352-222233"],
  ["District disaster management control room", "02352-226248"],
  ["State disaster management control room", "022-22027990"],
  ["Rescue and relief (state)", "1070"],
];

/* ------------------------------------------------------------------
   FACILITIES
   kind:    "hospital" | "police"
   name, taluka, village, address, phone   (strings, phone optional)
   lat, lng                                 (numbers, optional but recommended)

   - WITH lat/lng the PDF finds the nearest ones to each day's stops and
     draws them on that day's help map.
   - WITHOUT lat/lng the PDF lists them for any day that has a stop in the
     same taluka (no distance, no map pin).

   The three entries below come from the official district website and have
   no phone or coordinates yet. Add yours in the same shape, for example:

   { kind: "hospital", name: "Sub District Hospital, Dapoli", taluka: "Dapoli",
     village: "Dapoli", phone: "02358-XXXXXX", lat: 17.76, lng: 73.18 },
------------------------------------------------------------------- */
export const FACILITIES = [
  { kind: "hospital", name: "District Civil Hospital, Ratnagiri", taluka: "Ratnagiri", village: "Ratnagiri city", phone: "" },
  { kind: "police", name: "Ratnagiri City Police Station", taluka: "Ratnagiri", village: "Ratnagiri city", phone: "" },
  { kind: "police", name: "Ratnagiri Rural Police Station", taluka: "Ratnagiri", village: "Ratnagiri", phone: "" },
];

export const EMERGENCY_STEPS = [
  ["Medical emergency", "Call 108 or 112 first and say clearly where you are (village, nearest landmark, Google Maps pin). Keep the person still and warm, do not give food or water if they are unconscious, and send someone to meet the ambulance at the main road. Rural hospitals may be 30+ minutes away, so call early."],
  ["Road accident", "Move to safety, switch on hazard lights and call 112. Do not move an injured person unless there is danger such as fire. Note the vehicle number and location. Ghat roads have few landmarks, so share a Google Maps pin."],
  ["Sea or water emergency", "Shout for help, signal lifeguards or locals and call 112. Do not go in after someone without a float or rope. Many Konkan beaches have strong currents and no lifeguards, so stay out of the water in rough conditions."],
  ["Theft, lost phone or documents", "Report at the nearest police station and ask for a receipt or complaint number. Block your cards from your bank's app or helpline. Keep photos of your ID and booking confirmations in your phone or email."],
  ["Lost, stranded or no signal", "Stay on the main road, ask at a house, shop or temple for help and ask them to call 112 for you. Share your live location with family when signal returns. Fuel up and carry water before long rural stretches."],
  ["Safety of women and children", "Call 112 or 1091 (women) and 1098 (children). Choose homestays and drivers that have a contact number, and share the driver's vehicle number with family."],
];
