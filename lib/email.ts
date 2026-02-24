import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "127.0.0.1",
  port: Number(process.env.SMTP_PORT || 54325),
  secure: false,
});

export async function sendInviteEmail(
  to: string,
  babyName: string,
  acceptUrl: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@babyfoodplan.local",
    to,
    subject: `You're invited to help track ${babyName}'s meals`,
    html: `
      <h2>You've been invited!</h2>
      <p>Someone wants you to help track <strong>${babyName}</strong>'s food journey.</p>
      <p><a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#ec4899;color:#fff;border-radius:8px;text-decoration:none;">Accept Invitation</a></p>
      <p style="color:#888;font-size:12px;">This invitation expires in 7 days.</p>
    `,
  });
}
