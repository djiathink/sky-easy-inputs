export interface OdooUser {
  id: number;
  name: string;
  email: string;
}

export interface ActionButton {
  label: string;
  value: string;
  variant?: "primary" | "danger" | "secondary";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  buttons?: ActionButton[];
}

export interface OpportunityData {
  name: string;
  type: "opportunity";
  partner_id?: number;
  partner_name?: string;
  contact_name?: string;
  email_from?: string;
  phone?: string;
  mobile?: string;
  function?: string;
  expected_revenue?: number;
  probability?: number;
  date_deadline?: string;
  stage_id?: number;
  user_id?: number;
  team_id?: number;
  tag_ids?: number[];
  description?: string;
  street?: string;
  city?: string;
  zip?: string;
  country_id?: number;
  priority?: string;
}

export interface McpToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
