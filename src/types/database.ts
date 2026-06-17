export interface VaultItem {
  id: string; // UUID
  target_company: string;
  public_title: string;
  public_summary: string;
  private_markdown: string;
  created_at: string;
}

export interface AccessToken {
  token_string: string; // UUID
  vault_id: string; // Foreign Key to VaultItem
  recipient_name: string | null;
  expires_at: string | null;
  view_count: number;
}

export interface Frequency {
  id: string; // UUID
  type: string; // 'Long-form' | 'Note' | 'Code Snippet' | 'Math Logic'
  title: string | null;
  content_markdown: string;
  created_at: string;
}

export interface ActiveNode {
  id: string; // UUID
  title: string;
  status: string;
  tech_stack: string[];
  description: string | null;
  url: string | null;
}

export interface Trajectory {
  id: string; // UUID
  vector_id: string;
  metric: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}
