// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";  // usar compare para comparar hash
import { logAuthAction, LOG_ACTIONS } from "../../../utils/logging";

const prisma = new PrismaClient();

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "text", placeholder: "tu@correo.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Esta función se llama al hacer login con credenciales
        if (!credentials) return null;
        const { email, password } = credentials;
        // Buscar usuario por email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("Correo no registrado");
        }
        // Verificar contraseña
        const isValid = await compare(password, user.password_hash);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }
        // Retornar objeto de usuario (sin campos sensibles)
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  // Habilitar sesiones JWT (requerido para Credentials provider)
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 1 día de duración de sesión
  },
  pages: {
    signIn: "/auth/login",   // Página personalizada de login
    newUser: "/auth/register"  // (opcional) Podríamos dirigir al registro
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Log successful login
      if (user?.id) {
        await logAuthAction(
          user.id,
          LOG_ACTIONS.LOGIN,
          {
            method: account?.provider || 'credentials',
            email: user.email
          }
        );
      }
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
