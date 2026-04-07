import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const PRESAVE_LEADS_FILE = path.join(process.cwd(), "data", "presave-leads.json");

export async function GET() {
  try {
    const raw = await fs.readFile(PRESAVE_LEADS_FILE, "utf8");
    const leads = JSON.parse(raw);
    const list = Array.isArray(leads) ? leads : [];

    return NextResponse.json({
      totalPresaves: list.length,
      leads: list,
    });
  } catch {
    return NextResponse.json({
      totalPresaves: 0,
      leads: [],
    });
  }
}
