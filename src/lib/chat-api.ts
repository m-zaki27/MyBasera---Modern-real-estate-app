import { supabase } from '@/lib/supabase';

type StartConversationParams = {
  propertyId: string;
  agentId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string | null;
};

/** Opens the user's existing conversation about a listing, or starts one. Returns its ID. */
export async function getOrCreateConversation({
  propertyId,
  agentId,
  buyerId,
  buyerName,
  buyerAvatar,
}: StartConversationParams): Promise<string> {
  const { data: existing, error: selectError } = await supabase
    .from('conversations')
    .select('id')
    .eq('property_id', propertyId)
    .eq('buyer_id', buyerId)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({
      property_id: propertyId,
      agent_id: agentId,
      buyer_name: buyerName,
      buyer_avatar: buyerAvatar,
    })
    .select('id')
    .single();
  if (insertError) throw new Error(insertError.message);
  return created.id;
}

export async function sendMessage(conversationId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, body: body.trim() });
  if (error) throw new Error(error.message);
}

/** Marks the other person's unread messages in a conversation as read. */
export async function markConversationRead(conversationId: string, myUserId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myUserId)
    .is('read_at', null);
  if (error) console.warn(`Couldn't mark messages read: ${error.message}`);
}

type SubmitReviewParams = {
  dealId: string;
  propertyId: string;
  rating: number;
  comment: string;
};

/** Reviews are only accepted (by RLS) for the buyer's own completed deal, once per deal. */
export async function submitReview({ dealId, propertyId, rating, comment }: SubmitReviewParams): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    deal_id: dealId,
    property_id: propertyId,
    rating,
    comment: comment.trim() || null,
  });
  if (error) {
    if (error.code === '23505') throw new Error('You’ve already reviewed this deal.');
    throw new Error(error.message);
  }
}
