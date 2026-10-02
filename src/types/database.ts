// Hand-written to mirror supabase/migrations. If the Supabase CLI is added later,
// replace this file with `supabase gen types typescript --linked`.

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Condo' | 'Townhouse' | 'Studio';

export type ListingType = 'sale' | 'rent';

export type ListingStatus = 'active' | 'under_offer' | 'sold' | 'rented';

export type DealStatus =
  | 'negotiating'
  | 'accepted'
  | 'completed'
  | 'declined'
  | 'withdrawn'
  | 'cancelled';

export type DealSide = 'buyer' | 'agent';

export type DealEventKind =
  | 'offer'
  | 'counter'
  | 'accept'
  | 'decline'
  | 'withdraw'
  | 'cancel'
  | 'mark_complete'
  | 'completed';

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          email: string | null;
          phone: string | null;
          clerk_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          email?: string | null;
          phone?: string | null;
          clerk_user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          name: string;
          type: PropertyType;
          listing_type: ListingType;
          status: ListingStatus;
          price: number;
          address: string;
          latitude: number | null;
          longitude: number | null;
          bedrooms: number;
          bathrooms: number;
          area: number | null;
          rating: number;
          facilities: string[];
          agent_id: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: PropertyType;
          listing_type?: ListingType;
          status?: ListingStatus;
          price: number;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area?: number | null;
          rating?: number;
          facilities?: string[];
          agent_id?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'properties_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          deal_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          deal_id?: string | null;
          user_id?: string; // defaults to the Clerk user ID from the JWT
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'reviews_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          user_id?: string; // defaults to the Clerk user ID from the JWT
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'favorites_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          property_id: string;
          agent_id: string;
          buyer_id: string;
          buyer_name: string;
          buyer_avatar: string | null;
          created_at: string;
          last_message_at: string;
          last_message_preview: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          agent_id: string;
          buyer_id?: string; // defaults to the Clerk user ID from the JWT
          buyer_name: string;
          buyer_avatar?: string | null;
          created_at?: string;
          last_message_at?: string;
          last_message_preview?: string | null;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'conversations_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string; // defaults to the Clerk user ID from the JWT
          body: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: { read_at?: string | null };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          conversation_id: string;
          property_id: string;
          agent_id: string;
          buyer_id: string;
          deal_type: ListingType;
          status: DealStatus;
          amount: number;
          last_offer_by: DealSide;
          move_in_date: string | null;
          lease_months: number | null;
          created_at: string;
          updated_at: string;
          accepted_at: string | null;
          agent_completed_at: string | null;
          buyer_completed_at: string | null;
          completed_at: string | null;
          closed_at: string | null;
          close_reason: string | null;
        };
        // Deals are created and changed only through the RPC functions below.
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'deals_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      deal_events: {
        Row: {
          id: string;
          deal_id: string;
          actor: DealSide;
          kind: DealEventKind;
          amount: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'deal_events_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_own_agent: {
        Args: { agent: string };
        Returns: boolean;
      };
      is_conversation_participant: {
        Args: { conversation: string };
        Returns: boolean;
      };
      start_offer: {
        Args: {
          conversation: string;
          offer_amount: number;
          note?: string | null;
          move_in_date?: string | null;
          lease_months?: number | null;
        };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      counter_offer: {
        Args: { deal: string; offer_amount: number; note?: string | null };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      accept_offer: {
        Args: { deal: string };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      decline_offer: {
        Args: { deal: string; note?: string | null };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      withdraw_offer: {
        Args: { deal: string };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      cancel_deal: {
        Args: { deal: string; reason: string };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
      mark_deal_complete: {
        Args: { deal: string };
        Returns: Database['public']['Tables']['deals']['Row'];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database['public']['Tables'];

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row'];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];

export type Agent = Tables<'agents'>;
export type Property = Tables<'properties'>;
export type Review = Tables<'reviews'>;
export type Favorite = Tables<'favorites'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type Deal = Tables<'deals'>;
export type DealEvent = Tables<'deal_events'>;
