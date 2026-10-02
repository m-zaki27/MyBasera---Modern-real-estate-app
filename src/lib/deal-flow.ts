import type { Deal, DealSide, DealStatus } from '@/types/database';

/**
 * The deal flow in one place, so the deal screen, chat banner and deal list agree:
 *
 *   1 Offer → 2 Negotiation → 3 Accepted → 4 Completed (both confirm) → 5 Review
 *
 * "Whose turn" during negotiation = the side that did NOT make the latest offer.
 */

export const DEAL_STEPS = ['Offer', 'Negotiation', 'Accepted', 'Completed', 'Review'] as const;

export type DealAction =
  | 'accept'
  | 'counter'
  | 'decline'
  | 'withdraw'
  | 'mark_complete'
  | 'cancel'
  | 'review';

const OPEN_STATUSES: readonly DealStatus[] = ['negotiating', 'accepted'];

export function isOpenDeal(deal: Pick<Deal, 'status'>): boolean {
  return OPEN_STATUSES.includes(deal.status);
}

export function sideOf(deal: Pick<Deal, 'buyer_id'>, myUserId: string): DealSide {
  return deal.buyer_id === myUserId ? 'buyer' : 'agent';
}

/** True when the deal is waiting on me. */
export function isMyTurn(deal: Deal, mySide: DealSide): boolean {
  if (deal.status === 'negotiating') return deal.last_offer_by !== mySide;
  if (deal.status === 'accepted') {
    return mySide === 'agent' ? !deal.agent_completed_at : !deal.buyer_completed_at;
  }
  return false;
}

/**
 * Index into DEAL_STEPS of the step in progress; steps before it are done. Returns
 * DEAL_STEPS.length when everything is done. Closed deals stay where they stopped.
 */
export function currentStep(deal: Pick<Deal, 'status'>, hasReviewed: boolean): number {
  switch (deal.status) {
    case 'negotiating':
    case 'declined':
    case 'withdrawn':
      return 1; // the offer is made; negotiation is ongoing (or ended there)
    case 'accepted':
    case 'cancelled':
      return 3; // agreed; waiting for both sides to confirm completion (or cancelled there)
    case 'completed':
      return hasReviewed ? DEAL_STEPS.length : 4;
  }
}

/** The buttons to show me right now. */
export function availableActions(deal: Deal, mySide: DealSide, hasReviewed: boolean): DealAction[] {
  switch (deal.status) {
    case 'negotiating':
      return isMyTurn(deal, mySide) ? ['accept', 'counter', 'decline'] : ['withdraw'];
    case 'accepted': {
      const iConfirmed = mySide === 'agent' ? deal.agent_completed_at : deal.buyer_completed_at;
      return iConfirmed ? ['cancel'] : ['mark_complete', 'cancel'];
    }
    case 'completed':
      return mySide === 'buyer' && !hasReviewed ? ['review'] : [];
    default:
      return [];
  }
}

/** One-line status for lists and banners, from my point of view. */
export function describeStatus(deal: Deal, mySide: DealSide): string {
  const other = mySide === 'buyer' ? 'the agent' : `the ${deal.deal_type === 'rent' ? 'tenant' : 'buyer'}`;
  switch (deal.status) {
    case 'negotiating':
      return isMyTurn(deal, mySide) ? 'Your turn — respond to the offer' : `Waiting for ${other} to respond`;
    case 'accepted': {
      const iConfirmed = mySide === 'agent' ? deal.agent_completed_at : deal.buyer_completed_at;
      return iConfirmed
        ? `Waiting for ${other} to confirm completion`
        : 'Accepted — mark as completed after the handover';
    }
    case 'completed':
      return 'Completed';
    case 'declined':
      return 'Declined';
    case 'withdrawn':
      return 'Offer withdrawn';
    case 'cancelled':
      return 'Cancelled';
  }
}

/** What happens at the accepted stage, shown as a checklist (Pakistani property practice). */
export function nextStepsAfterAcceptance(dealType: Deal['deal_type']): string[] {
  return dealType === 'rent'
    ? [
        'Visit the property and check its condition together.',
        'Agree the security deposit and advance rent.',
        'Sign the rent agreement on stamp paper (both CNICs, two witnesses).',
        'Hand over the keys, then both mark the deal as completed.',
        'Register the tenancy with the police (link shown after completion).',
      ]
    : [
        'Arrange a final viewing and verify the ownership documents.',
        'Pay the token money (bayana) and sign the sale agreement.',
        'Complete the payment and transfer (registry / mutation or society transfer).',
        'Hand over possession, then both mark the deal as completed.',
      ];
}
