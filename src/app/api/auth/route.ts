import { NextRequest, NextResponse } from "next/server";
import { callMcpTool } from "@/lib/mcp-client";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const result = await callMcpTool("odoo_search_read", {
      model: "res.users",
      domain: [["email", "=", email.trim().toLowerCase()]],
      fields: ["id", "name", "email"],
      limit: 1,
    });

    const users = result as Array<{ id: number; name: string; email: string }>;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email dans Odoo" },
        { status: 404 }
      );
    }

    const user = users[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur Odoo" },
      { status: 500 }
    );
  }
}
