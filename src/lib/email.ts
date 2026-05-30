import { Resend } from 'resend';

// Om API-nyckel saknas, returnera null så vi kan hantera det gracefully (lokalt)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Gemensam base-style för alla emails för att matcha plattformens Glassmorphism/Modern UI
const baseHtml = (content: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #1e40af; margin-top: 0;">Annonsen</h1>
      ${content}
      <p style="color: #71717a; font-size: 12px; margin-top: 40px;">
        Detta är ett automatiskt genererat meddelande från Annonsen.se.
      </p>
    </div>
  </div>
`;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  // Om vi saknar nyckel (t.ex. lokal utveckling) så loggar vi istället för att skicka
  if (!resend) {
    console.log("-----------------------------------------------------");
    console.log(`📧 MOCK EMAIL SKICKAT TILL: ${to}`);
    console.log(`Ämne: ${subject}`);
    console.log(`Reply-To: ${replyTo || 'N/A'}`);
    console.log(`(Lokal utveckling - lägg in RESEND_API_KEY i .env för att skicka på riktigt)`);
    console.log("-----------------------------------------------------");
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Annonsen <noreply@annonsen.se>', // Byt till din verifierade domän i Resend
      to,
      subject,
      html: baseHtml(html),
      replyTo: replyTo,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// ==========================================
// Färdiga Mallar
// ==========================================

export async function sendJobApplicationEmail(employerEmail: string, jobTitle: string, applicantName: string, applicantEmail: string) {
  const content = `
    <h2 style="color: #18181b;">Ny arbetsansökan!</h2>
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">
      Du har fått en ny ansökan till din tjänst <strong>${jobTitle}</strong> från <strong>${applicantName}</strong>.
    </p>
    <a href="https://annonsen.se/dashboard/ansokningar" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
      Gå till Ansökningar
    </a>
  `;
  return sendEmail({
    to: employerEmail,
    subject: `Ny ansökan till: ${jobTitle}`,
    html: content,
    replyTo: applicantEmail // Gör att arbetsgivaren kan trycka Svara direkt till sökanden
  });
}

export async function sendCompanyApprovalEmail(companyEmail: string) {
  const content = `
    <h2 style="color: #18181b;">Ditt konto är godkänt! 🎉</h2>
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">
      Vi har nu granskat och godkänt din företagsprofil på Annonsen. Din butikssida är nu live och du kan börja publicera annonser!
    </p>
    <a href="https://annonsen.se/skapa" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
      Skapa din första annons
    </a>
  `;
  return sendEmail({
    to: companyEmail,
    subject: "Ditt företagskonto är nu godkänt på Annonsen",
    html: content
  });
}

export async function sendPasswordResetEmail(userEmail: string, token: string) {
  // Länken bör peka på den riktiga domänen i prod, för nu hårdkodar vi bas-URL:en
  const resetLink = `http://localhost:3000/aterstall-losenord?token=${token}`; // Byt localhost mot env.NEXT_PUBLIC_APP_URL i prod
  
  const content = `
    <h2 style="color: #18181b;">Återställning av lösenord</h2>
    <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">
      Någon har begärt att återställa lösenordet för ditt konto. Om detta var du, klicka på knappen nedan. Länken är giltig i 1 timme.
    </p>
    <a href="${resetLink}" style="display: inline-block; background-color: #ef4444; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
      Återställ Lösenord
    </a>
    <p style="color: #71717a; font-size: 14px; margin-top: 20px;">
      Om du inte begärde denna återställning kan du tryggt ignorera detta mejl.
    </p>
  `;
  return sendEmail({
    to: userEmail,
    subject: "Återställ ditt lösenord - Annonsen",
    html: content
  });
}
