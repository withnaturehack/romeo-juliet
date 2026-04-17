---
name: Profiles JSONB Category Migration
overview: Migrate the profiles table from many fixed columns to a category-based JSONB schema where each category (e.g., basic_information, location_and_future_plans) stores flexible question/answer data as JSON, enabling question changes without schema migrations.
todos: []
isProject: false
---

# Profiles JSONB Category Migration Plan

## Target Schema

**Keep as top-level columns** (auth, routing, media, timestamps):

- `id`, `user_id`, `created_at`, `updated_at`
- `is_complete`, `voice_conversation_completed`
- `display_name`, `social_link`, `main_photo_url`, `photo2_url`, `photo3_url`
- `conversation_summary` (voice output)
- `interview_data`, `processed_data` (if used elsewhere)

**New JSONB columns** (one per category, snake_case):


| Column                                 | Category                                                            |
| -------------------------------------- | ------------------------------------------------------------------- |
| `basic_information`                    | Date of birth, age range, gender, who to meet                       |
| `location_and_future_plans`            | Where based, plans to stay, relocating, future location             |
| `work_and_life_stage`                  | Work type, financial lifestyle, weekly schedule                     |
| `education_and_intellectual_life`      | Education, intellectual match importance, conversation topics       |
| `relationship_direction_and_readiness` | Building toward, structure, space, emotional availability, pace     |
| `family_and_children`                  | Current children, desire for children, dating someone with children |
| `lifestyle`                            | Day-to-day lifestyle, smoking (self + partner)                      |
| `values_faith_and_culture`             | Faith role, partner faith importance, traditions                    |
| `political_and_social_outlook`         | Politics importance, comfort with different views, values           |
| `physical_and_attraction`              | Height, preferred height, qualities, attraction importance          |


Each JSONB column stores a flexible object, e.g.:

```json
{
  "date_of_birth": "1995-03-15",
  "age_range_min": 25,
  "age_range_max": 35,
  "gender": "woman",
  "who_to_meet": "straight",
  "pronouns": "she/her"
}
```

---

## Migration Strategy

### Phase 1: Add columns and migrate data (non-destructive)

1. **Add new JSONB columns** via SQL migration (Supabase Dashboard or CLI):
  ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS basic_information jsonb DEFAULT '{}';
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_and_future_plans jsonb DEFAULT '{}';
   -- ... (all 10 category columns)
  ```
2. **Backfill existing data** with a one-time migration script (run in Supabase SQL Editor or as a Node script):
  - Map old columns into the appropriate JSONB objects
  - Use `jsonb_set` or `||` to merge; do not drop old columns yet
   **Column mapping (old → new JSONB path):**
  - `age` → `basic_information.age`
  - `gender` → `basic_information.gender`
  - `sexual_orientation` → `basic_information.who_to_meet`
  - `pronouns` → `basic_information.pronouns`
  - `lifestyle_location` → `location_and_future_plans.where_based`
  - `work_situation` → `work_and_life_stage.work_situation`
  - `relationship_direction` → `relationship_direction_and_readiness.building_toward`
  - `children` → `family_and_children.children_desire` (or similar)
  - `faith_integration` → `values_faith_and_culture.faith_role`
  - `political_alignment` → `political_and_social_outlook.politics_importance`
3. **Update app code** to read/write from JSONB columns:
  - [src/app/onboarding/page.tsx](src/app/onboarding/page.tsx) – Step 1 (basics)
  - [src/app/onboarding/step-2/page.tsx](src/app/onboarding/step-2/page.tsx) – Foundations
  - [src/app/onboarding/step-3/page.tsx](src/app/onboarding/step-3/page.tsx) – Photos/social
  - [src/app/api/voice/summarize/route.ts](src/app/api/voice/summarize/route.ts) – conversation_summary (stays top-level)
4. **Create a shared profile helper** (e.g. `src/lib/profile.ts`):
  - `getProfileData(userId)` – fetches profile, returns typed object with category JSONB merged
  - `updateProfileCategory(userId, category, data)` – merges `data` into that category’s JSONB
  - TypeScript types for each category shape (loose enough for flexibility)

### Phase 2: Deprecate old columns (after verification)

1. **Remove old columns** once the app reads/writes only JSONB and you’ve verified data:
  ```sql
   ALTER TABLE profiles DROP COLUMN IF EXISTS age;
   ALTER TABLE profiles DROP COLUMN IF EXISTS gender;
   -- ... etc.
  ```

---

## Key Implementation Details

**Upsert pattern for JSONB:**

```typescript
// Merge new answers into existing category
const { data: existing } = await supabase
  .from("profiles")
  .select("basic_information")
  .eq("user_id", userId)
  .single();

const merged = { ...(existing?.basic_information ?? {}), ...newAnswers };

await supabase
  .from("profiles")
  .update({ basic_information: merged, updated_at: new Date().toISOString() })
  .eq("user_id", userId);
```

Or use Postgres `jsonb_set` / `||` in a raw SQL function for atomic merge.

**Onboarding flow changes:**

- Restructure steps to align with categories (e.g., Step 1 = basic_information, Step 2 = location + work, etc.)
- Each step loads the relevant category JSONB, renders questions from a config (so you can change questions without code changes), and saves back to that category

**Question config approach:**

- Define questions in a config file (e.g. `src/config/onboarding-questions.ts`) keyed by category
- Each question has: `id`, `type` (text/select/radio), `options` (if applicable), `required`
- Add/remove/reorder questions by editing the config; no DB migrations

---

## Files to Create/Modify


| File                                                            | Action                                             |
| --------------------------------------------------------------- | -------------------------------------------------- |
| `supabase/migrations/YYYYMMDD_add_profile_category_columns.sql` | Add 10 JSONB columns                               |
| `supabase/migrations/YYYYMMDD_backfill_profile_categories.sql`  | One-time data migration                            |
| `src/lib/profile.ts`                                            | Profile fetch/update helpers, category merge logic |
| `src/config/onboarding-questions.ts`                            | Question definitions per category                  |
| `src/app/onboarding/page.tsx`                                   | Read/write `basic_information`                     |
| `src/app/onboarding/step-2/page.tsx`                            | Read/write foundations categories                  |
| `src/app/onboarding/step-3/page.tsx`                            | Photos/social (unchanged; uses top-level columns)  |
| Future: new onboarding steps                                    | Map to remaining categories                        |


---

## Data Migration SQL (Backfill)

```sql
-- Example: backfill basic_information from old columns
UPDATE profiles
SET basic_information = jsonb_build_object(
  'age', age,
  'gender', gender,
  'who_to_meet', sexual_orientation,
  'pronouns', pronouns
)
WHERE age IS NOT NULL OR gender IS NOT NULL OR sexual_orientation IS NOT NULL OR pronouns IS NOT NULL;
```

Repeat for each category with its mapped columns. Use `COALESCE` and `||` to merge with existing JSONB if some rows already have partial data.