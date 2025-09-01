-- Rename indexes in emails table
ALTER INDEX IF EXISTS "emails_provider_id_idx" RENAME TO "idx_emails_provider_id";
ALTER INDEX IF EXISTS "emails_message_id_idx" RENAME TO "idx_emails_message_id";
ALTER INDEX IF EXISTS "emails_to_address_idx" RENAME TO "idx_emails_to_address";
ALTER INDEX IF EXISTS "emails_status_idx" RENAME TO "idx_emails_status";
ALTER INDEX IF EXISTS "emails_user_id_idx" RENAME TO "idx_emails_user_id";
ALTER INDEX IF EXISTS "emails_created_at_idx" RENAME TO "idx_emails_created_at";

-- Rename indexes in email_events table
ALTER INDEX IF EXISTS "email_events_email_id_idx" RENAME TO "idx_email_events_email_id";
ALTER INDEX IF EXISTS "email_events_event_type_idx" RENAME TO "idx_email_events_event_type";
ALTER INDEX IF EXISTS "email_events_timestamp_idx" RENAME TO "idx_email_events_timestamp";

-- Rename indexes in email_templates table
ALTER INDEX IF EXISTS "email_templates_name_idx" RENAME TO "idx_email_templates_name";
ALTER INDEX IF EXISTS "email_templates_is_active_idx" RENAME TO "idx_email_templates_is_active";

-- Rename indexes in knowledges table
ALTER INDEX IF EXISTS "idx_knowledge_user_id" RENAME TO "idx_knowledges_user_id";
ALTER INDEX IF EXISTS "idx_knowledge_status" RENAME TO "idx_knowledges_status";

-- Rename indexes in chunks table
ALTER INDEX IF EXISTS "idx_chunks_knowledge_base" RENAME TO "idx_chunks_knowledge_base_id";
ALTER INDEX IF EXISTS "idx_chunks_knowledge_user" RENAME TO "idx_chunks_knowledge_base_id_user_id";