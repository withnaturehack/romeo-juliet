# Onboarding Data Storage

This folder contains JSON files with user onboarding data.

## Structure

```
data/
└── onboarding/
    └── [user-id]/
        ├── basic_info.json
        ├── location_future.json
        └── complete.json
```

## Files

- **`basic_info.json`** - Basic user information (DOB, age range, gender, preferences)
- **`location_future.json`** - Location and future plans data
- **`complete.json`** - Combined data from all onboarding sections

## Example Data

### basic_info.json
```json
{
  "date_of_birth": "1995-05-15",
  "age_range_min": 25,
  "age_range_max": 35,
  "gender": "woman",
  "looking_for_gender": "men",
  "saved_at": "2026-02-25T10:30:00.000Z"
}
```

### complete.json
```json
{
  "basic_info": { ... },
  "location_future": { ... },
  "last_updated": "2026-02-25T10:30:00.000Z",
  "user_id": "abc-123-xyz"
}
```

## Notes

- This folder is automatically created when the first user submits data
- Each user gets their own subfolder named by their user ID
- Files are in JSON format with proper indentation (2 spaces)
- This folder is excluded from version control via `.gitignore`
