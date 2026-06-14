/**
 * api/audit.js — Activity logging client.
 *
 * Sends user activity events to the Render backend, which writes them
 * to Supabase's audit_log table. The Clerk session token is attached
 * so the backend can verify the user and extract their email/ID.
 *
 * Events are fire-and-forget — failures are silently logged to console
 * so they never interrupt the user experience.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Log a user activity event.
 *
 * @param {function} getToken - Clerk's getToken() from useAuth()
 * @param {string}   eventType - 'login' | 'logout' | 'view_report' | 'view_topics' | 'change_date' | 'click_topic_card'
 * @param {object}   eventMeta - Additional context, e.g. { report_date: "2026-06-14" }
 */
export async function logEvent(getToken, eventType, eventMeta = {}) {
  try {
    const token = await getToken();
    if (!token) return; // Not signed in

    await fetch(`${API_BASE}/api/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_type: eventType,
        event_meta: eventMeta,
      }),
    });
  } catch (err) {
    console.warn(`[audit] Failed to log ${eventType}:`, err.message);
  }
}
