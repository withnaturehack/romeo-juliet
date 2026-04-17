export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  pronouns: string | null;
  sexual_orientation: string | null;
  location: string | null;
  occupation: string | null;
  education: Record<string, string | null> | null;
  family: Record<string, string | null> | null;
  lifestyle: Record<string, string | null> | null;
  values: Record<string, string | null> | null;
  politics: Record<string, string | null> | null;
  relationship: Record<string, string | null> | null;
  physical: Record<string, string | null> | null;
  work: Record<string, string | null> | null;
  loc_and_future: Record<string, string | null> | null;
  photo_main: string | null;
  photo_2: string | null;
  photo_3: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  conversation_transcript: ConversationTurn[] | null;
  onboarding_step: number;
  onboarding_completed_at: string | null;
  email_notifications: boolean;
  updated_at: string;
  created_at: string;
}

export interface ConversationTurn {
  role: "user" | "assistant";
  message: string;
  time_in_call_secs?: number;
}

export interface Membership {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | "applied";
  referral_code_used: string | null;
  application_data: Record<string, unknown> | null;
  applied_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  match_score: number | null;
  match_decision: "pending" | "approved" | "rejected" | "expired";
  compatibility_summary: string | null;
  strengths: string[] | null;
  tensions: string[] | null;
  dealbreakers: string[] | null;
  match_reason: string | null;
  archetype_dynamic: string | null;
  introduced_at: string | null;
  status:
    | "pending_review"
    | "introduced"
    | "accepted_by_user"
    | "accepted_by_match"
    | "active"
    | "declined"
    | "expired";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "new_match"
    | "match_accepted"
    | "match_declined"
    | "new_message"
    | "membership_approved"
    | "system";
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  match_id: string | null;
  reason: "harassment" | "spam" | "inappropriate" | "fake_profile" | "other";
  details: string | null;
  status: "pending" | "reviewed" | "action_taken" | "dismissed";
  created_at: string;
}
