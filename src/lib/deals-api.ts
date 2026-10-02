import { supabase } from '@/lib/supabase';
import type { Deal } from '@/types/database';

// Every deal transition is a database function that checks whose turn it is, so these
// are thin wrappers. Errors raised in SQL come back with a user-readable message.

type RpcResult = { data: Deal | null; error: { message: string } | null };

function unwrap({ data, error }: RpcResult): Deal {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('The deal could not be updated.');
  return data;
}

type StartOfferParams = {
  conversationId: string;
  amount: number;
  note?: string;
  /** ISO date (YYYY-MM-DD), rentals only. */
  moveInDate?: string | null;
  leaseMonths?: number | null;
};

export async function startOffer({ conversationId, amount, note, moveInDate, leaseMonths }: StartOfferParams) {
  return unwrap(
    await supabase.rpc('start_offer', {
      conversation: conversationId,
      offer_amount: amount,
      note: note?.trim() || null,
      move_in_date: moveInDate ?? null,
      lease_months: leaseMonths ?? null,
    })
  );
}

export async function counterOffer(dealId: string, amount: number, note?: string) {
  return unwrap(
    await supabase.rpc('counter_offer', { deal: dealId, offer_amount: amount, note: note?.trim() || null })
  );
}

export async function acceptOffer(dealId: string) {
  return unwrap(await supabase.rpc('accept_offer', { deal: dealId }));
}

export async function declineOffer(dealId: string, note?: string) {
  return unwrap(await supabase.rpc('decline_offer', { deal: dealId, note: note?.trim() || null }));
}

export async function withdrawOffer(dealId: string) {
  return unwrap(await supabase.rpc('withdraw_offer', { deal: dealId }));
}

export async function cancelDeal(dealId: string, reason: string) {
  return unwrap(await supabase.rpc('cancel_deal', { deal: dealId, reason: reason.trim() }));
}

export async function markDealComplete(dealId: string) {
  return unwrap(await supabase.rpc('mark_deal_complete', { deal: dealId }));
}
