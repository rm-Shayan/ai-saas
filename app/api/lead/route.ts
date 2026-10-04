import { NextRequest, NextResponse } from "next/server";
import { LeadModel } from "@/models/lead.model";
import { db } from "@/lib/db-config/db";

// In-memory fallback when MongoDB is unreachable (demo/test convenience)
const memoryLeads: any[] = [];

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
    await db;
    if (!body?.email || !body?.name) {
      return NextResponse.json({ success: false, message: "Name and email required" }, { status: 400 });
    }
    const lead = await LeadModel.create(body);
    return NextResponse.json({ success: true, data: lead, message: "Lead captured" });
  } catch (e) {
    // If DB fails (common in restricted/dev environments), fallback to memory
    const msg = String(e);
    if (msg.includes("querySrv") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
      if (body?.name && body?.email) {
        memoryLeads.push({...body, createdAt: new Date().toISOString()});
        return NextResponse.json({ success: true, data: body, message: "Lead captured (memory fallback)" });
      }
    }
    console.error("Lead API error:", e);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: "lead api ready", leads: memoryLeads });
}
