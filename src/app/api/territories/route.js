import prisma from "@/lib/prisma";

export async function GET() {
  const territories = await prisma.territories.findMany();
  return Response.json(territories);
}

export async function POST(req) {
  const body = await req.json();
  const newTerritory = await prisma.territories.create({
    data: {
      territoryName: body.territoryName,
    },
  });
  return Response.json(newTerritory);
}

export async function PUT(req) {
  const body = await req.json();
  if (!body.territoryId)
    return Response.json({ error: "Territory ID required" }, { status: 400 });

  const updated = await prisma.territories.update({
    where: { territoryId: body.territoryId },
    data: { territoryName: body.territoryName },
  });
  return Response.json(updated);
}

export async function DELETE(req) {
  const body = await req.json();
  if (!body.territoryId)
    return Response.json({ error: "Territory ID required" }, { status: 400 });

  await prisma.territories.delete({
    where: { territoryId: body.territoryId },
  });
  return Response.json({ success: true });
}
