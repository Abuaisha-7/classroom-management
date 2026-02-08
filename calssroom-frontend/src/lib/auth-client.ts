import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import z from "zod";
import { BACKEND_BASE_URL } from "../constants";

export const authClient = createAuthClient({
  baseURL: `${BACKEND_BASE_URL.replace(/\/$/, "")}/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
          defaultValue: "student",
          input: false,
          validator: {
            output: z.enum(["student", "teacher", "admin"]),
          },
        },
        department: {
          type: "string",
          required: false,
          input: true,
        },
        imageCldPubId: {
          type: "string",
          required: false,
          input: true,
        },
      },
    }),
  ],
});
