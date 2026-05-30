import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "E-post",
      credentials: {
        email: { label: "E-post", type: "email", placeholder: "din@epost.se" },
        password: { label: "Lösenord", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Fel e-post eller lösenord");
        }

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) {
          throw new Error("Fel e-post eller lösenord");
        }

        if (user.isBlocked) {
          throw new Error("Ditt konto är blockerat av en administratör");
        }

        // Auto-admin för Root-mail via miljövariabel
        const rootEmail = process.env.ROOT_ADMIN_EMAIL?.toLowerCase();
        const userEmail = user.email?.toLowerCase();
        
        if (rootEmail && userEmail === rootEmail && (!user.isAdmin || !user.isRoot)) {
          await prisma.user.update({
            where: { email: user.email },
            data: { isAdmin: true, isRoot: true }
          });
          user.isAdmin = true;
          user.isRoot = true;
        }

        return {
          id: user.id, 
          email: user.email, 
          name: user.name, 
          isAdmin: user.isAdmin,
          isRoot: user.isRoot,
          accountType: user.accountType,
          companyName: user.companyName,
          companyLogoUrl: user.companyLogoUrl,
          termsAccepted: user.termsAccepted
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.isRoot = (user as any).isRoot;
        token.accountType = (user as any).accountType;
        token.companyName = (user as any).companyName;
        token.companyLogoUrl = (user as any).companyLogoUrl;
        token.termsAccepted = (user as any).termsAccepted;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      if (trigger === "update" && session?.termsAccepted) {
        token.termsAccepted = true;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;
        (session.user as any).isRoot = token.isRoot as boolean;
        (session.user as any).accountType = token.accountType as string;
        (session.user as any).companyName = token.companyName as string;
        (session.user as any).companyLogoUrl = token.companyLogoUrl as string;
        (session.user as any).termsAccepted = token.termsAccepted as boolean;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretkey_dev_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
