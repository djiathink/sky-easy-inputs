import { callMcpTool } from "./mcp-client";

export async function handleToolCall(
  toolName: string,
  input: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case "search_partners":
      return await searchPartners(input.name as string);
    case "get_stages":
      return await getStages();
    case "get_sales_teams":
      return await getSalesTeams();
    case "get_users":
      return await getUsers();
    case "get_tags":
      return await getTags();
    case "create_opportunity":
      return await createOpportunity(input);
    case "list_my_opportunities":
      return await listMyOpportunities(
        input.user_id as number,
        (input.limit as number) || 10
      );
    case "update_opportunity_stage":
      return await updateOpportunityStage(
        input.opportunity_id as number,
        input.stage_id as number
      );
    default:
      return JSON.stringify({ error: `Outil inconnu: ${toolName}` });
  }
}

async function searchPartners(name: string): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "res.partner",
    domain: [["name", "ilike", name]],
    fields: ["id", "name", "email", "phone", "is_company"],
    limit: 10,
  });
  return JSON.stringify(result);
}

async function getStages(): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "crm.stage",
    fields: ["id", "name", "sequence"],
    order: "sequence asc",
    limit: 20,
  });
  return JSON.stringify(result);
}

async function getSalesTeams(): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "crm.team",
    fields: ["id", "name"],
    limit: 20,
  });
  return JSON.stringify(result);
}

async function getUsers(): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "res.users",
    domain: [["share", "=", false]],
    fields: ["id", "name", "email"],
    limit: 50,
  });
  return JSON.stringify(result);
}

async function getTags(): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "crm.tag",
    fields: ["id", "name"],
    limit: 50,
  });
  return JSON.stringify(result);
}

async function createOpportunity(
  data: Record<string, unknown>
): Promise<string> {
  const values: Record<string, unknown> = {
    type: "opportunity",
    name: data.name,
  };

  const directFields = [
    "partner_id", "partner_name", "contact_name", "email_from",
    "phone", "mobile", "function", "expected_revenue", "probability",
    "date_deadline", "stage_id", "user_id", "team_id", "description",
    "priority",
  ];

  for (const field of directFields) {
    if (data[field] !== undefined && data[field] !== null) {
      values[field] = data[field];
    }
  }

  if (data.tag_ids && Array.isArray(data.tag_ids) && data.tag_ids.length > 0) {
    values.tag_ids = [[6, 0, data.tag_ids]];
  }

  const result = await callMcpTool("odoo_create", {
    model: "crm.lead",
    values,
  });

  return JSON.stringify({ success: true, id: result });
}

async function listMyOpportunities(
  userId: number,
  limit: number
): Promise<string> {
  const result = await callMcpTool("odoo_search_read", {
    model: "crm.lead",
    domain: [
      ["user_id", "=", userId],
      ["type", "=", "opportunity"],
      ["active", "=", true],
    ],
    fields: [
      "id", "name", "partner_name", "contact_name", "expected_revenue",
      "stage_id", "date_deadline", "probability", "priority",
    ],
    order: "create_date desc",
    limit,
  });
  return JSON.stringify(result);
}

async function updateOpportunityStage(
  opportunityId: number,
  stageId: number
): Promise<string> {
  await callMcpTool("odoo_update", {
    model: "crm.lead",
    ids: [opportunityId],
    values: { stage_id: stageId },
  });
  return JSON.stringify({ success: true, opportunity_id: opportunityId, stage_id: stageId });
}
