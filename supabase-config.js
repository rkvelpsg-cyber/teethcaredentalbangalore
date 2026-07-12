/* ═══════════════════════════════════════════════
   SUPABASE CLIENT – ASIAN DENTAL CLINIC
   Shared across index.html (patient site) and
   doctor-dashboard.html
═══════════════════════════════════════════════ */
const SUPABASE_URL = "https://mgatkllhwudtqwqiznra.supabase.co";
const SUPABASE_ANON = "sb_publishable_GuEdV4zUdC3AfGJ0M6JwFQ_SEox4v0R";

// Exposed on window so all scripts can access it
window._sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
