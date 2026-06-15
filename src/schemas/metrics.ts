import { z } from "zod";

// Mirrors the onboarding metrics form. Server re-validates in M5.
export const metricsSchema = z.object({
  unit: z.enum(["metric", "imperial"]),
  age: z.coerce
    .number({ invalid_type_error: "Enter your age" })
    .int("Age must be a whole number")
    .min(13, "You must be at least 13")
    .max(100, "Please enter a valid age"),
  sex: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Select your sex" }),
  }),
  weight: z.coerce
    .number({ invalid_type_error: "Enter your weight" })
    .positive("Enter a valid weight")
    .max(500, "Please enter a valid weight"),
  height: z.coerce
    .number({ invalid_type_error: "Enter your height" })
    .positive("Enter a valid height")
    .max(300, "Please enter a valid height"),
  activity: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["lose", "maintain", "gain_muscle", "gain_weight"]),
  dietary: z.array(
    z.enum([
      "vegetarian",
      "vegan",
      "halal",
      "low_carb",
      "high_protein",
      "gluten_free",
      "lactose_free",
      "pescatarian",
    ])
  ),
});

export type MetricsValues = z.infer<typeof metricsSchema>;
