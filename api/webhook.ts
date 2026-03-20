import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';

// Vercel serverless function types (inline to avoid extra dependency)
interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: any;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}
interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(data: any): VercelResponse;
  setHeader(name: string, value: string): VercelResponse;
  end(): VercelResponse;
}

/**
 * Premura Webhook Endpoint
 *
 * Receives appointment data from GoHighLevel workflows and inserts
 * into Supabase. Replaces the n8n automation entirely.
 *
 * GoHighLevel workflow should send a POST to:
 *   https://your-domain.vercel.app/api/webhook
 *
 * Expected payload (custom data fields from GHL workflow):
 * {
 *   // --- Required fields ---
 *   "company_id": "{{location.id}}",            // GHL sub-account/location ID
 *   "company_name": "{{business.name}}",         // Company/business name
 *   "contact_name": "{{contact.name}}",          // Lead's full name
 *   "phone_number": "{{contact.phone}}",         // Lead's phone
 *   "email": "{{contact.email}}",                // Lead's email
 *   "address": "{{contact.address1}} {{contact.city}} {{contact.state}} {{contact.postal_code}}",
 *   "contact_id": "{{contact.id}}",              // GHL contact ID
 *
 *   // --- Appointment fields ---
 *   "setter_name": "{{contact.appt_setter_number}}", // or custom field for setter
 *   "closer_name": "{{user.name}}",              // Assigned user / closer
 *   "booked_for": "{{appointment.only_start_date}}",
 *   "appointment_type": "{{appointment.calendar_name}}", // Calendar name
 *
 *   // --- Optional solar/roofing fields ---
 *   "roof_type": "{{contact.roof_type}}",
 *   "existing_solar": "{{contact.existing_solar}}",
 *   "shading": "{{contact.shading}}",
 *   "credit_score": "{{contact.credit_score}}",
 *   "notes": "{{contact.notes}}",
 *   "contact_link": "{{contact.contact_link}}",
 *   "recording_media_link": "{{contact.recording_media_link}}"
 * }
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // --- CORS headers (allow GHL to call this) ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // --- Validate environment ---
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // --- Optional: webhook secret for extra security ---
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const incomingSecret = req.headers['x-webhook-secret'] || req.query?.secret;
    if (incomingSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized: invalid webhook secret' });
    }
  }

  // --- Parse payload ---
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid payload: expected JSON body' });
  }

  // Initialize Supabase with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // --- Extract fields from GHL payload ---
    // Handle both flat payload and nested GHL webhook structures
    const companyId = body.company_id || body.location_id || body.locationId || '';
    const companyName = body.company_name || body.campaign_name || body['Campaign name'] || body.business_name || '';
    const contactName = body.contact_name || body.name || body.full_name ||
                        `${body.first_name || ''} ${body.last_name || ''}`.trim() || '';
    const phoneNumber = body.phone_number || body.phone || body.contact_phone || '';
    const email = body.email || body.contact_email || '';
    const address = body.address || body.full_address ||
                    `${body.address1 || ''} ${body.city || ''} ${body.state || ''} ${body.postal_code || ''}`.trim() || '';
    const contactId = body.contact_id || body.contactId || '';
    const setterName = body.setter_name || body.appointment_setter || body['appointment setter'] || '';
    const closerName = body.closer_name || body.closer || body.assigned_to || '';
    const bookedFor = body.booked_for || body.booked_for_date || body['Booked for'] || null;
    const appointmentType = body.appointment_type || body.calendar_name || '';
    const roofType = body.roof_type || '';
    const existingSolar = body.existing_solar || null;
    const shading = body.shading || '';
    const creditScore = body.credit_score || null;
    const notes = body.notes || body.note || '';
    const contactLink = body.contact_link || '';
    const recordingMediaLink = body.recording_media_link || '';
    const confirmed = body.confirmed === true || body.confirmed === 'true' || false;
    const systemSize = body.system_size || null;

    // --- Validate minimum required fields ---
    if (!companyId) {
      return res.status(400).json({
        error: 'Missing required field: company_id (send location.id from GHL)',
        received_fields: Object.keys(body)
      });
    }

    // --- Step 1: Upsert company into companies table ---
    if (companyName) {
      const { error: companyError } = await supabase
        .from('companies')
        .upsert(
          { company_id: companyId, company_name: companyName },
          { onConflict: 'company_id' }
        );

      if (companyError) {
        console.error('Company upsert error:', companyError.message);
        // Don't fail the whole request — the appointment insert is more important
      }
    }

    // --- Step 2: Insert appointment ---
    const appointmentRecord = {
      company_id: companyId,
      name: contactName || null,
      closer_name: closerName || null,
      booked_for: bookedFor || null,
      note: notes || null,
      phone_number: phoneNumber || null,
      address: address || null,
      setter_name: setterName || null,
      email: email || null,
      contact_link: contactLink || null,
      recording_media_link: recordingMediaLink || null,
      credit_score: creditScore || null,
      roof_type: roofType || null,
      existing_solar: existingSolar,
      shading: shading || null,
      appointment_type: appointmentType || null,
      confirmed: confirmed,
      contact_id: contactId || null,
      system_size: systemSize,
      "Company Name": companyName || null,
      // These fields start as defaults
      disposition_date: null,
      site_survey: null,
      m1_commission: 0,
      m2_commission: 0,
      confirmation_disposition: null,
      dq_reason: null,
    };

    const { data: insertedAppt, error: apptError } = await supabase
      .from('appointments')
      .insert(appointmentRecord)
      .select('id, company_id, name, setter_name, created_at')
      .single();

    if (apptError) {
      console.error('Appointment insert error:', apptError.message);
      return res.status(500).json({
        error: 'Failed to insert appointment',
        details: apptError.message
      });
    }

    // --- Success ---
    console.log(`Appointment created: ${insertedAppt.id} for ${companyName} — ${contactName}`);

    return res.status(200).json({
      success: true,
      message: 'Appointment recorded successfully',
      appointment: {
        id: insertedAppt.id,
        company_id: insertedAppt.company_id,
        name: insertedAppt.name,
        setter_name: insertedAppt.setter_name,
        created_at: insertedAppt.created_at,
      }
    });

  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
