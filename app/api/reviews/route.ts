import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://frequencyframed.ie"
  ).replace(/\/$/, "");
}

function getAdminReviewEmailHtml({
  reviewerName,
  reviewerRole,
  reviewText,
  rating,
  artworkTitle,
  adminUrl,
}: {
  reviewerName: string;
  reviewerRole: string | null;
  reviewText: string;
  rating: number;
  artworkTitle: string;
  adminUrl: string;
}) {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/images/logo.png`;

  return `
    <div style="margin:0;padding:0;background:#f7f2ec;font-family:Arial,Helvetica,sans-serif;color:#3d2b22;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #eadfd3;padding:40px 32px;box-shadow:0 12px 30px rgba(0,0,0,0.04);">
          <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #efe5da;">
            <img
              src="${logoUrl}"
              alt="Frequency Framed"
              style="display:block;margin:0 auto 18px;max-width:220px;height:auto;"
            />
            <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#8b6f5d;">
              Frequency Framed
            </p>
            <h1 style="margin:18px 0 0;font-size:30px;line-height:1.05;font-weight:500;color:#4b3226;">
              New Review Received
            </h1>
          </div>

          <div style="padding-top:28px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#6c5445;">
              A new collector review has just been submitted and is waiting for approval.
            </p>

            <div style="margin:28px 0;padding:22px;background:#fbf8f4;border:1px solid #efe5da;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8b6f5d;">
                Review Details
              </p>

              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
                <strong>Reviewer:</strong> ${reviewerName}
              </p>

              ${
                reviewerRole
                  ? `
                <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
                  <strong>Role / Location:</strong> ${reviewerRole}
                </p>
              `
                  : ""
              }

              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4b3226;">
                <strong>Artwork:</strong> ${artworkTitle}
              </p>

              <p style="margin:0;font-size:15px;line-height:1.7;color:#4b3226;">
                <strong>Rating:</strong> ${"★".repeat(rating)}
              </p>
            </div>

            <div style="margin:28px 0;padding:22px;background:#fbf8f4;border:1px solid #efe5da;">
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8b6f5d;">
                Review Text
              </p>

              <p style="margin:0;font-size:15px;line-height:1.9;color:#6c5445;">
                “${reviewText}”
              </p>
            </div>

            <div style="margin-top:28px;">
              <a
                href="${adminUrl}"
                style="display:inline-block;background:#4b3226;color:#ffffff;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;"
              >
                Open Admin Reviews
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = String(body.token || "").trim();
    const reviewer_name = String(body.reviewer_name || "").trim();
    const reviewer_role = String(body.reviewer_role || "").trim();
    const review_text = String(body.review_text || "").trim();
    const rating = Number(body.rating || 5);

    if (!token) {
      return NextResponse.json(
        { error: "Invalid review token." },
        { status: 400 }
      );
    }

    if (!reviewer_name) {
      return NextResponse.json(
        { error: "Your name is required." },
        { status: 400 }
      );
    }

    if (!review_text) {
      return NextResponse.json(
        { error: "Review text is required." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating." },
        { status: 400 }
      );
    }

    const { data: reviewRequest, error: requestError } = await supabaseAdmin
      .from("artwork_review_requests")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (requestError || !reviewRequest) {
      return NextResponse.json(
        { error: "Review request not found." },
        { status: 404 }
      );
    }

    if (reviewRequest.used) {
      return NextResponse.json(
        { error: "This review link has already been used." },
        { status: 400 }
      );
    }

    const { data: artwork, error: artworkError } = await supabaseAdmin
      .from("artworks")
      .select("id, slug, title")
      .eq("slug", reviewRequest.artwork_slug)
      .maybeSingle();

    if (artworkError || !artwork) {
      return NextResponse.json(
        { error: "Artwork not found." },
        { status: 404 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("artwork_reviews")
      .insert({
        artwork_id: artwork.id,
        reviewer_name,
        reviewer_role: reviewer_role || null,
        review_text,
        sort_order: 0,
        is_published: false,
        rating,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Failed to save review." },
        { status: 500 }
      );
    }

    const { error: markUsedError } = await supabaseAdmin
      .from("artwork_review_requests")
      .update({ used: true })
      .eq("id", reviewRequest.id);

    if (markUsedError) {
      return NextResponse.json(
        { error: "Review saved, but token update failed." },
        { status: 500 }
      );
    }

    const adminReviewsUrl = `${getSiteUrl()}/admin/reviews`;
    const natanEmail =
      process.env.REVIEW_NOTIFICATION_EMAIL || "hello@frequencyframed.ie";

    try {
      await resend.emails.send({
        from: "Frequency Framed <hello@frequencyframed.ie>",
        to: natanEmail,
        subject: "New review received – Frequency Framed",
        text: `
A new review has been submitted and is waiting for approval.

Reviewer: ${reviewer_name}
${reviewer_role ? `Role / Location: ${reviewer_role}` : ""}
Artwork: ${artwork.title}
Rating: ${"★".repeat(rating)}

Review:
"${review_text}"

Open admin reviews:
${adminReviewsUrl}
        `,
        html: getAdminReviewEmailHtml({
          reviewerName: reviewer_name,
          reviewerRole: reviewer_role || null,
          reviewText: review_text,
          rating,
          artworkTitle: artwork.title || reviewRequest.artwork_slug,
          adminUrl: adminReviewsUrl,
        }),
      });
    } catch (emailError) {
      console.error("Review notification email error:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Public review submit error:", error);
    return NextResponse.json(
      { error: "Something went wrong while submitting your review." },
      { status: 500 }
    );
  }
}