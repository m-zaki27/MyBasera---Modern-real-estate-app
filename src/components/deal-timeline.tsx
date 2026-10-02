import { Text, View } from 'react-native';

import { formatMessageTime, formatPrice } from '@/lib/format';
import type { DealEvent, DealSide, ListingType } from '@/types/database';

type DealTimelineProps = {
  events: DealEvent[];
  mySide: DealSide;
  dealType: ListingType;
};

const VERBS: Record<DealEvent['kind'], string> = {
  offer: 'offered',
  counter: 'countered with',
  accept: 'accepted',
  decline: 'declined',
  withdraw: 'withdrew the offer',
  cancel: 'cancelled the deal',
  mark_complete: 'marked the deal as completed',
  completed: 'Deal completed',
};

/** Offer history, oldest first. */
export function DealTimeline({ events, mySide, dealType }: DealTimelineProps) {
  return (
    <View className="gap-4">
      {events.map((event, index) => {
        const who = event.actor === mySide ? 'You' : event.actor === 'agent' ? 'Agent' : dealType === 'rent' ? 'Tenant' : 'Buyer';
        const sentence =
          event.kind === 'completed'
            ? VERBS.completed
            : `${who} ${VERBS[event.kind]}${
                event.amount && (event.kind === 'offer' || event.kind === 'counter' || event.kind === 'accept')
                  ? ` ${formatPrice(event.amount, dealType)}`
                  : ''
              }`;
        const isLast = index === events.length - 1;
        return (
          <View key={event.id} className="flex-row gap-3">
            <View className="items-center">
              <View className={`mt-1 h-3 w-3 rounded-full ${isLast ? 'bg-primary' : 'bg-border dark:bg-border-dark'}`} />
              {isLast ? null : <View className="w-0.5 flex-1 bg-border dark:bg-border-dark" />}
            </View>
            <View className="flex-1 gap-0.5 pb-1">
              <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">{sentence}</Text>
              {event.note ? (
                <Text className="text-sm text-muted dark:text-muted-dark">“{event.note}”</Text>
              ) : null}
              <Text className="text-xs text-muted dark:text-muted-dark">{formatMessageTime(event.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
