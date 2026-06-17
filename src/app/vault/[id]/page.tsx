import { createClient } from "@supabase/supabase-js";
import { VaultItem, AccessToken } from "@/types/database";
import { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Secure Vault Payload",
  robots: "noindex, nofollow",
};

export default async function VaultItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const vaultId = resolvedParams.id;
  const token = resolvedSearchParams.token as string | undefined;

  if (!token) {
    return <AccessDenied reason="MISSING_AUTHORIZATION_TOKEN" />;
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from("access_tokens")
    .select("*")
    .eq("token_string", token)
    .eq("vault_id", vaultId)
    .single();

  if (tokenError || !tokenData) {
    return <AccessDenied reason="INVALID_TOKEN_OR_VAULT_MISMATCH" />;
  }

  const access = tokenData as AccessToken;

  // Check expiration
  if (access.expires_at) {
    const expiresAt = new Date(access.expires_at).getTime();
    const now = new Date().getTime();
    if (now > expiresAt) {
      return <AccessDenied reason="TOKEN_EXPIRED" />;
    }
  }

  // Update view count
  await supabaseAdmin
    .from("access_tokens")
    .update({ view_count: access.view_count + 1 })
    .eq("token_string", token);

  // Fetch private markdown
  const { data: vaultData, error: vaultError } = await supabaseAdmin
    .from("the_vault")
    .select("*")
    .eq("id", vaultId)
    .single();

  if (vaultError || !vaultData) {
    return <AccessDenied reason="PAYLOAD_NOT_FOUND" />;
  }

  const item = vaultData as VaultItem;

  return (
    <div className="w-full pt-32 pb-16">
      <div className="terminal-border p-6 mb-8 border-green-900/50 bg-green-950/10">
        <div className="flex justify-between items-center text-xs font-mono mb-4">
          <span className="text-green-500">SECURE CONNECTION ESTABLISHED</span>
          <span className="text-gray-500">VIEWS: {access.view_count + 1}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
          {item.public_title}
        </h1>
        <div className="text-gray-400 font-mono text-sm">
          Target: {item.target_company} | Recipient: {access.recipient_name || "UNKNOWN"}
        </div>
      </div>

      <div 
        className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-img:rounded-lg prose-img:border prose-img:border-gray-800 prose-img:w-full max-w-none font-mono text-sm p-6 terminal-border"
        dangerouslySetInnerHTML={{ __html: item.private_markdown }}
      />
    </div>
  );
}

function AccessDenied({ reason }: { reason: string }) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center items-center">
      <div className="terminal-border border-red-900 p-8 max-w-md w-full text-center bg-red-950/10">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-xl font-bold text-red-500 mb-4 tracking-widest">
          ACCESS DENIED
        </h1>
        <div className="text-gray-400 font-mono text-sm bg-black/50 p-4 border border-red-900/50">
          <div className="text-red-400 mb-2">ERR_UNAUTHORIZED</div>
          <div className="break-all">{reason}</div>
        </div>
      </div>
    </div>
  );
}
