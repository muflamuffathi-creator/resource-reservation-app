import { prisma } from "./prisma";

export interface ConflictCheckParams {
  resourceId: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictDetails?: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    bookedBy: string;
  };
  error?: string;
}

/**
 * Checks whether a requested reservation time window collides with existing active bookings.
 * 
 * Mathematical Overlap Condition:
 * Two time intervals [A_start, A_end] and [B_start, B_end] overlap if and only if:
 *   A_start < B_end  AND  A_end > B_start
 */
export async function checkReservationConflict({
  resourceId,
  startTime,
  endTime,
  excludeReservationId,
}: ConflictCheckParams): Promise<ConflictResult> {
  // 1. Validation: End time must be strictly after Start time
  if (startTime >= endTime) {
    return {
      hasConflict: true,
      error: "End time must be after start time.",
    };
  }

  // 2. Query for overlapping confirmed reservations on the same resource
  const conflict = await prisma.reservation.findFirst({
    where: {
      resourceId,
      status: { not: "CANCELLED" },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      // Interval overlap check:
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      resource: {
        select: {
          name: true,
        },
      },
    },
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictDetails: {
        id: conflict.id,
        title: conflict.title,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        bookedBy: conflict.user?.name || conflict.user?.email || "Another team member",
      },
      error: `Conflict detected: "${conflict.resource.name}" is already booked for "${conflict.title}" from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} by ${conflict.user?.name}.`,
    };
  }

  return { hasConflict: false };
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
