<?php
/**
 * Teeth Care Dental Clinic – Enquiry Form Email Handler
 * Receives POST from enquiry form and emails it to the clinic admin.
 *
 * SETUP:
 *  1. Update $adminEmail to the clinic's real email address.
 *  2. Host this file on a PHP-enabled server (e.g., cPanel shared hosting).
 *  3. Ensure your server's mail() function or SMTP relay is configured.
 *
 * For production use with reliable delivery, replace mail() with PHPMailer + SMTP.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

/* ── Configuration ──────────────────────────── */
$adminEmail   = 'admin@teethcaredental.com';   // <-- Change to clinic email
$clinicName   = 'Teeth Care Dental Clinic';
$allowedOrigin = '';  // Set to your domain, e.g. 'https://teethcaredental.com'

/* ── Security: only accept POST ──────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ── CSRF / Origin check (optional but recommended) ── */
if ($allowedOrigin !== '' && isset($_SERVER['HTTP_ORIGIN'])) {
    if ($_SERVER['HTTP_ORIGIN'] !== $allowedOrigin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }
}

/* ── Rate limiting via session ────────────────── */
session_start();
$now = time();
if (!isset($_SESSION['last_enquiry'])) {
    $_SESSION['last_enquiry'] = 0;
}
if ($now - $_SESSION['last_enquiry'] < 60) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please wait a moment.']);
    exit;
}

/* ── Sanitise & validate inputs ──────────────── */
function sanitise(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

$name    = sanitise($_POST['name']    ?? '');
$phone   = sanitise($_POST['phone']   ?? '');
$email   = sanitise($_POST['email']   ?? '');
$message = sanitise($_POST['message'] ?? '');

$errors = [];

if (empty($name) || strlen($name) > 120) {
    $errors[] = 'Invalid name.';
}

if (empty($phone) || !preg_match('/^[+\d\s\-()]{7,20}$/', $phone)) {
    $errors[] = 'Invalid phone number.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    $errors[] = 'Invalid email address.';
}

if (strlen($message) > 2000) {
    $errors[] = 'Message is too long.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── Build email ──────────────────────────────── */
$submittedAt = date('d M Y, h:i A');
$ipAddress   = filter_var($_SERVER['REMOTE_ADDR'] ?? 'unknown', FILTER_VALIDATE_IP) ?: 'unknown';

$subject = "New Enquiry from {$name} – {$clinicName}";

$body = <<<EMAIL
You have received a new enquiry via the {$clinicName} website.

─────────────────────────────────
 Patient Enquiry Details
─────────────────────────────────
 Name         : {$name}
 Phone Number : {$phone}
 Email        : {$email}
 Submitted At : {$submittedAt}
 IP Address   : {$ipAddress}
─────────────────────────────────
 Message:

{$message}
─────────────────────────────────

Please follow up with the patient promptly.

──
{$clinicName}
9, Balagere Main Rd, Varthur, Bengaluru – 560087
Phone: +91-8073601660
──
This is an automated notification. Do not reply to this email directly.
EMAIL;

/* Build HTML version for nicer inbox display */
$bodyHtml = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'><title>New Enquiry</title></head>
<body style='font-family: Arial, sans-serif; background:#f1f5f9; margin:0; padding:30px;'>
  <table style='max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);'>
    <tr>
      <td style='background:linear-gradient(135deg,#0284c7,#14b8a6);padding:30px 36px;text-align:center;'>
        <h1 style='color:#fff;margin:0;font-size:1.5rem;'>🦷 {$clinicName}</h1>
        <p style='color:rgba(255,255,255,.85);margin:8px 0 0;font-size:.95rem;'>New Patient Enquiry</p>
      </td>
    </tr>
    <tr>
      <td style='padding:36px;'>
        <table style='width:100%;border-collapse:collapse;'>
          <tr><td style='padding:10px;background:#f8fafc;border-radius:8px;font-weight:700;color:#0f172a;width:140px;'>Name</td><td style='padding:10px;color:#334155;'>{$name}</td></tr>
          <tr><td style='padding:10px;font-weight:700;color:#0f172a;'>Phone</td><td style='padding:10px;color:#334155;'><a href='tel:{$phone}' style='color:#0284c7;'>{$phone}</a></td></tr>
          <tr><td style='padding:10px;background:#f8fafc;border-radius:8px;font-weight:700;color:#0f172a;'>Email</td><td style='padding:10px;background:#f8fafc;color:#334155;'><a href='mailto:{$email}' style='color:#0284c7;'>{$email}</a></td></tr>
          <tr><td style='padding:10px;font-weight:700;color:#0f172a;'>Submitted</td><td style='padding:10px;color:#334155;'>{$submittedAt}</td></tr>
        </table>
        <div style='margin-top:24px;padding:20px;background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:8px;'>
          <p style='font-weight:700;color:#0f172a;margin:0 0 10px;'>Message:</p>
          <p style='color:#334155;line-height:1.7;margin:0;'>" . nl2br($message) . "</p>
        </div>
        <p style='margin-top:28px;font-size:.85rem;color:#94a3b8;'>Please follow up with the patient within 24 hours.</p>
      </td>
    </tr>
    <tr>
      <td style='background:#0f172a;padding:20px 36px;text-align:center;'>
        <p style='color:rgba(255,255,255,.6);font-size:.8rem;margin:0;'>{$clinicName} | 9, Balagere Main Rd, Varthur, Bengaluru – 560087 | +91-8073601660</p>
      </td>
    </tr>
  </table>
</body>
</html>
";

/* ── Send email ───────────────────────────────── */
$boundary = md5(uniqid('', true));
$headers  = implode("\r\n", [
    "From: {$clinicName} Website <noreply@teethcaredental.com>",
    "Reply-To: {$email}",
    "MIME-Version: 1.0",
    "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
    "X-Mailer: PHP/" . PHP_VERSION,
]);

$multipartBody = implode("\r\n", [
    "--{$boundary}",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    $body,
    "",
    "--{$boundary}",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    $bodyHtml,
    "",
    "--{$boundary}--",
]);

$sent = mail($adminEmail, $subject, $multipartBody, $headers);

/* Also send a confirmation email to the patient */
if ($sent) {
    $confirmSubject = "We received your enquiry – {$clinicName}";
    $confirmBody    = "Dear {$name},\n\nThank you for reaching out to {$clinicName}!\n\nWe have received your enquiry and one of our team members will contact you at {$phone} within 24 hours.\n\nIf you need immediate assistance, please call us:\n📞 +91-8073601660\n\nWarm regards,\nTeam {$clinicName}\n9, Balagere Main Rd, Varthur, Bengaluru – 560087\n";
    $confirmHeaders = "From: {$clinicName} <noreply@teethcaredental.com>\r\nContent-Type: text/plain; charset=UTF-8";
    @mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

    /* Update rate limiter */
    $_SESSION['last_enquiry'] = $now;

    echo json_encode(['success' => true, 'message' => 'Enquiry sent successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please call us directly.']);
}
