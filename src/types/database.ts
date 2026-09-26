// Hand-written to mirror supabase/migrations. If the Supabase CLI is added later,
// replace this file with `supabase gen types typescript --linked`.

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Condo' | 'Townhouse' | 'Studio';

export type ListingType = 'sale' | 'rent';

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
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
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
    };
    Views: { [_ in never]: never };
    Functions: {
      is_own_agent: {
        Args: { agent: string };
        Returns: boolean;
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
