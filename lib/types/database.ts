export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      babies: {
        Row: {
          id: string;
          name: string;
          date_of_birth: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date_of_birth: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date_of_birth?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      baby_members: {
        Row: {
          id: string;
          baby_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          user_id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "baby_members_baby_id_fkey";
            columns: ["baby_id"];
            isOneToOne: false;
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "baby_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      baby_invitations: {
        Row: {
          id: string;
          baby_id: string;
          email: string;
          invited_by: string | null;
          token: string;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          email: string;
          invited_by?: string | null;
          token?: string;
          status?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          baby_id?: string;
          email?: string;
          invited_by?: string | null;
          token?: string;
          status?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "baby_invitations_baby_id_fkey";
            columns: ["baby_id"];
            isOneToOne: false;
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
        ];
      };
      food_items: {
        Row: {
          id: string;
          baby_id: string;
          name: string;
          category: string[];
          created_by: string | null;
          created_at: string;
          stats_dismissed: boolean;
        };
        Insert: {
          id?: string;
          baby_id: string;
          name: string;
          category?: string[];
          created_by?: string | null;
          created_at?: string;
          stats_dismissed?: boolean;
        };
        Update: {
          id?: string;
          baby_id?: string;
          name?: string;
          category?: string[];
          stats_dismissed?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_items_baby_id_fkey";
            columns: ["baby_id"];
            isOneToOne: false;
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
        ];
      };
      food_logs: {
        Row: {
          id: string;
          baby_id: string;
          food_item_id: string;
          fed_at: string;
          logged_by: string | null;
          notes: string | null;
          reaction: string | null;
        };
        Insert: {
          id?: string;
          baby_id: string;
          food_item_id: string;
          fed_at?: string;
          logged_by?: string | null;
          notes?: string | null;
          reaction?: string | null;
        };
        Update: {
          id?: string;
          baby_id?: string;
          food_item_id?: string;
          fed_at?: string;
          logged_by?: string | null;
          notes?: string | null;
          reaction?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "food_logs_baby_id_fkey";
            columns: ["baby_id"];
            isOneToOne: false;
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "food_logs_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_id_by_email: {
        Args: { p_email: string };
        Returns: string;
      };
      is_baby_member: {
        Args: { p_baby_id: string };
        Returns: boolean;
      };
      is_baby_owner: {
        Args: { p_baby_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Baby = Database["public"]["Tables"]["babies"]["Row"];
export type BabyMember = Database["public"]["Tables"]["baby_members"]["Row"];
export type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];
export type FoodLog = Database["public"]["Tables"]["food_logs"]["Row"];
export type BabyInvitation = Database["public"]["Tables"]["baby_invitations"]["Row"];
export type FoodReaction = "loved" | "okay" | "disliked";

export type FoodCategory =
  | "fruit"
  | "veggie"
  | "grain"
  | "protein"
  | "dairy"
  | "snack"
  | "other";

export type FoodItemWithDaysSince = FoodItem & {
  days_since_last_fed: number | null;
  last_fed_at: string | null;
};

export type FoodItemWithStats = FoodItemWithDaysSince & {
  last_reaction: FoodReaction | null;
  stats_dismissed: boolean;
};

export type FoodLogWithItem = FoodLog & {
  food_items: Pick<FoodItem, "name" | "category">;
};

export const ALL_FOOD_CATEGORIES: FoodCategory[] = [
  "fruit",
  "veggie",
  "grain",
  "protein",
  "dairy",
  "snack",
  "other",
];

export type BabyMemberWithProfile = BabyMember & {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
};
