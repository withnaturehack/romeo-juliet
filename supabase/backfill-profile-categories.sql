-- Run in Supabase Dashboard → SQL Editor
-- One-time backfill: migrate old profile columns into new JSONB category columns.
-- Does NOT drop old columns. Run after add-profile-category-columns.sql.

-- 1. basic_information: age, gender, sexual_orientation, pronouns
UPDATE profiles
SET basic_information = COALESCE(basic_information, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'age', age,
    'gender', gender,
    'who_to_meet', sexual_orientation,
    'pronouns', pronouns
  ));

-- 2. location_and_future_plans: where_based = Edinburgh for ALL users; migrate old lifestyle_location as area_type
UPDATE profiles
SET location_and_future_plans = COALESCE(location_and_future_plans, '{}')
  || jsonb_build_object('where_based', 'Edinburgh')
  || jsonb_strip_nulls(jsonb_build_object('area_type', lifestyle_location));

-- 3. work_and_life_stage: work_situation
UPDATE profiles
SET work_and_life_stage = COALESCE(work_and_life_stage, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'work_situation', work_situation
  ))
WHERE work_situation IS NOT NULL;

-- 4. relationship_direction_and_readiness: building_toward (from relationship_direction)
UPDATE profiles
SET relationship_direction_and_readiness = COALESCE(relationship_direction_and_readiness, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'building_toward', relationship_direction
  ))
WHERE relationship_direction IS NOT NULL;

-- 5. family_and_children: children_desire (from children)
UPDATE profiles
SET family_and_children = COALESCE(family_and_children, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'children_desire', children
  ))
WHERE children IS NOT NULL;

-- 6. values_faith_and_culture: faith_role (from faith_integration)
UPDATE profiles
SET values_faith_and_culture = COALESCE(values_faith_and_culture, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'faith_role', faith_integration
  ))
WHERE faith_integration IS NOT NULL;

-- 7. political_and_social_outlook: politics_importance (from political_alignment)
UPDATE profiles
SET political_and_social_outlook = COALESCE(political_and_social_outlook, '{}')
  || jsonb_strip_nulls(jsonb_build_object(
    'politics_importance', political_alignment
  ))
WHERE political_alignment IS NOT NULL;
