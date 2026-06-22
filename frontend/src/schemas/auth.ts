import { z } from "zod";

// Validation mirrors the prototype's client checks; the server re-validates in M4.
export const registerStep1Schema = z.object({
  firstName: z.string().trim().min(2, "Please enter your first name"),
  lastName: z.string().trim().min(2, "Please enter your last name"),
  studentId: z.string().trim().min(3, "Please enter a valid student ID"),
  email: z.string().trim().email("Please enter a valid email address"),
  department: z.string().min(1, "Please select your department"),
});

export const registerStep2Schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Please agree to the Terms of Service to continue." }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const registerSchema = registerStep1Schema.and(
  z.object({
    password: z.string().min(8),
    confirm: z.string(),
    terms: z.literal(true),
  })
);

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Please enter your student ID or email"),
  password: z.string().min(1, "Please enter your password"),
});

export type RegisterStep1 = z.infer<typeof registerStep1Schema>;
export type RegisterValues = z.infer<typeof registerStep1Schema> & {
  password: string;
  confirm: string;
  terms: boolean;
};
export type LoginValues = z.infer<typeof loginSchema>;
