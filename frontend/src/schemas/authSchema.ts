import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  confirmPassword: z.string(),
})

.refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
