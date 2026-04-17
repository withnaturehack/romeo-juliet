export function validateStep1(data: {
  display_name?: string;
  age?: number;
  gender?: string;
  sexual_orientation?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!data.display_name?.trim()) errors.display_name = "Name is required";
  if ((data.display_name?.length ?? 0) > 50)
    errors.display_name = "Name must be under 50 characters";
  if (!data.age || data.age < 18) errors.age = "You must be 18 or older";
  if (data.age && data.age > 100) errors.age = "Please enter a valid age";
  if (!data.gender) errors.gender = "Please select your gender";
  if (!data.sexual_orientation)
    errors.sexual_orientation = "Please select your orientation";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep2Section(
  sectionKey: string,
  data: Record<string, string | null | undefined>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const answered = Object.values(data).filter(
    (v) => v !== null && v !== "" && v !== undefined
  );
  if (answered.length === 0)
    errors[sectionKey] = "Please answer at least one question";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep3(photos: {
  main: File | string | null;
  photo2?: File | string | null;
  photo3?: File | string | null;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!photos.main) errors.main = "At least one photo is required";
  return { valid: Object.keys(errors).length === 0, errors };
}
