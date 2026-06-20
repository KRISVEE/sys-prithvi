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
    <div className="w-full pt-32 pb-16 px-4 sm:px-8 lg:px-12 break-words overflow-hidden">
      <div className="p-6 mb-8 border border-green-900/50 bg-black/30 backdrop-blur-md shadow-2xl rounded-sm">
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
        className="prose prose-sm sm:prose-base prose-invert prose-p:text-gray-300 prose-headings:text-white prose-img:rounded-lg prose-img:border prose-img:border-gray-800 prose-img:max-w-full prose-img:h-auto max-w-full font-mono text-sm p-4 sm:p-6 border border-gray-800/50 bg-black/30 backdrop-blur-md shadow-2xl rounded-sm"
        dangerouslySetInnerHTML={{ __html: item.private_markdown }}
      />

      {/* SOCIAL TRAILING SIGNATURE */}
      <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-wrap gap-6 text-[10px] sm:text-xs font-mono tracking-widest text-gray-500 uppercase">
        <a href="https://x.com/koronovoid" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">[X / TWITTER]</a>
        <a href="https://medium.com/@Void.Prithvi" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">[MEDIUM]</a>
        <a href="https://www.instagram.com/prithvi.dll/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">[INSTAGRAM]</a>
        <a href="mailto:yoitspandamon@zohomail.in" className="hover:text-white transition-colors">[SECURE COMMS]</a>
      </div>
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
