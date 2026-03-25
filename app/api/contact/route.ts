import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, company } = body;

    // Honeypot anti-spam
    if (company) {
      return Response.json({ success: true });
    }

    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const to = process.env.CONTACT_TO_EMAIL;

    if (!to) {
      return Response.json(
        { error: "Missing CONTACT_TO_EMAIL configuration." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "Frequency Framed <Hello@frequencyframed.ie>",
      to,
      replyTo: email,
      subject: `New enquiry: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);

    return Response.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 }
    );
  }
}