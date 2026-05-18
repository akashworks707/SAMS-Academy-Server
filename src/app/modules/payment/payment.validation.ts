// import { z } from "zod";
// import { Currency, PaymentMethod, PaymentStatus } from "./payment.interface";

// export const createPaymentZodSchema = z.object({
//     user: z.string(),

//     course: z.string().optional(),

//     amount: z.number().min(1),

//     currency: z.nativeEnum(Currency).optional(),

//     paymentMethod: z.nativeEnum(PaymentMethod),

//     status: z.nativeEnum(PaymentStatus).optional(),
//     isDeleted: z.boolean().optional()
// });

// export const updatePaymentZodSchema = z.object({
//     amount: z.number().min(1).optional(),

//     currency: z.nativeEnum(Currency).optional(),

//     paymentMethod: z.nativeEnum(PaymentMethod).optional(),

//     status: z.nativeEnum(PaymentStatus).optional(),

//     isDeleted: z.boolean().optional()
// });