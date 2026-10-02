import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { useMyDealForListing } from '@/hooks/use-my-deal-for-listing';
import { showAlert } from '@/lib/alert';
import { getOrCreateConversation } from '@/lib/chat-api';
import { describeStatus, isOpenDeal } from '@/lib/deal-flow';
import type { ListingStatus, ListingType } from '@/types/database';

type ListingDealActionsProps = {
  propertyId: string;
  listingType: ListingType;
  status: ListingStatus;
  agent: { id: string; clerk_user_id: string | null } | null;
};

/** Listing page CTAs for buyers/tenants: make an offer (or view it) and message the agent. */
export function ListingDealActions({ propertyId, listingType, status, agent }: ListingDealActionsProps) {
  const { user } = useUser();
  const myDeal = useMyDealForListing(propertyId);
  const [opening, setOpening] = useState(false);

  if (!user || !agent || agent.clerk_user_id === user.id) return null; // own listing

  // Seeded demo agents (and agents added outside the app) have no account to deal with.
  if (!agent.clerk_user_id) {
    return (
      <Text className="text-sm text-muted dark:text-muted-dark">
        This agent isn’t on MyBasera yet, so offers and chat aren’t available — call or email them
        below.
      </Text>
    );
  }

  const openChat = async () => {
    setOpening(true);
    try {
      const email = user.primaryEmailAddress?.emailAddress;
      const conversationId = await getOrCreateConversation({
        propertyId,
        agentId: agent.id,
        buyerId: user.id,
        buyerName: user.fullName || email?.split('@')[0] || 'MyBasera user',
        buyerAvatar: user.hasImage ? user.imageUrl : null,
      });
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
    } catch (err) {
      showAlert("Couldn't open the chat", err instanceof Error ? err.message : String(err));
    } finally {
      setOpening(false);
    }
  };

  const isRent = listingType === 'rent';
  const showMyDeal = myDeal && (isOpenDeal(myDeal) || myDeal.status === 'completed');

  return (
    <View className="gap-3">
      {showMyDeal ? (
        <View className="gap-1">
          <PrimaryButton
            title={myDeal.status === 'completed' ? 'View your deal' : isRent ? 'View your application' : 'View your offer'}
            onPress={() => router.push({ pathname: '/deal/[id]', params: { id: myDeal.id } })}
          />
          <Text className="text-center text-xs text-muted dark:text-muted-dark">{describeStatus(myDeal, 'buyer')}</Text>
        </View>
      ) : status === 'active' ? (
        <PrimaryButton
          title={isRent ? 'Apply to rent' : 'Make an offer'}
          onPress={() => router.push({ pathname: '/offer/new', params: { propertyId } })}
        />
      ) : (
        <Text className="text-center text-sm text-muted dark:text-muted-dark">
          {status === 'under_offer'
            ? 'This listing is under offer and isn’t taking new offers right now.'
            : `This listing has been ${status}.`}
        </Text>
      )}
      <PrimaryButton title="Message agent" variant="outline" onPress={openChat} loading={opening} />
    </View>
  );
}
