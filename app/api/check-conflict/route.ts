import { NextResponse } from "next/server";
import { checkReservationConflict } from "@/lib/conflicts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resourceId, startTime, endTime, excludeReservationId } = body;

    if (!resourceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: resourceId, startTime, endTime" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const result = await checkReservationConflict({
      resourceId,
      startTime: start,
      endTime: end,
      excludeReservationId,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
