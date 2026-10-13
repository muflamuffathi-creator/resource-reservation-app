import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReservationConflict } from "@/lib/conflicts";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {};
    if (resourceId) whereClause.resourceId = resourceId;
    if (status) whereClause.status = status;

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        resource: {
          include: {
            category: true,
          },
        },
        user: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(reservations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load reservations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resourceId, userId, title, startTime, endTime, notes } = body;

    if (!resourceId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Resource, title, startTime, and endTime are required." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format." },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "End time must be strictly after start time." },
        { status: 400 }
      );
    }

    // Default to the first user if none provided (for demo convenience)
    let finalUserId = userId;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return NextResponse.json({ error: "No user found in database." }, { status: 400 });
      }
      finalUserId = defaultUser.id;
    }

    // CRITICAL: Conflict check inside transaction to prevent race conditions
    const createdReservation = await prisma.$transaction(async (tx) => {
      // 1. Check for overlapping reservations
      const conflict = await tx.reservation.findFirst({
        where: {
          resourceId,
          status: { not: "CANCELLED" },
          startTime: { lt: end },
          endTime: { gt: start },
        },
        include: {
          resource: true,
          user: true,
        },
      });

      if (conflict) {
        throw new Error(
          `Schedule Conflict: "${conflict.resource.name}" is already reserved for "${conflict.title}" during this time window.`
        );
      }

      // 2. Check resource status
      const resource = await tx.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resource || resource.status !== "ACTIVE") {
        throw new Error(`This resource is currently unavailable for booking.`);
      }

      // 3. Create confirmed reservation
      return tx.reservation.create({
        data: {
          resourceId,
          userId: finalUserId,
          title,
          startTime: start,
          endTime: end,
          notes: notes || null,
          status: "CONFIRMED",
        },
        include: {
          resource: {
            include: { category: true },
          },
          user: true,
        },
      });
    });

    return NextResponse.json(createdReservation, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create reservation";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, title, startTime, endTime, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Reservation ID is required." }, { status: 400 });
    }

    // If updating time, check conflicts
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const existing = await prisma.reservation.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
      }

      const conflictCheck = await checkReservationConflict({
        resourceId: existing.resourceId,
        startTime: start,
        endTime: end,
        excludeReservationId: id,
      });

      if (conflictCheck.hasConflict) {
        return NextResponse.json({ error: conflictCheck.error }, { status: 409 });
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          startTime: start,
          endTime: end,
          notes: notes ?? existing.notes,
          status: status ?? existing.status,
        },
        include: { resource: true, user: true },
      });

      return NextResponse.json(updated);
    }

    // Status update (e.g. Cancel)
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: status,
      },
      include: { resource: true, user: true },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update reservation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
