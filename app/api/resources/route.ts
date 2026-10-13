import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        category: true,
        reservations: {
          where: {
            status: "CONFIRMED",
            endTime: { gte: new Date() },
          },
          orderBy: { startTime: "asc" },
          take: 3,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(resources);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, categoryId, location, capacity, description, status } = body;

    if (!name || !categoryId || !location) {
      return NextResponse.json(
        { error: "Name, category, and location are required." },
        { status: 400 }
      );
    }

    const newResource = await prisma.resource.create({
      data: {
        name,
        categoryId,
        location,
        capacity: Number(capacity) || 1,
        description: description || null,
        status: status || "ACTIVE",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
