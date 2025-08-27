CREATE INDEX "idx_apikey_user_id" ON "apikey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_apikey_key" ON "apikey" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_chunks_knowledge_base" ON "chunks" USING btree ("knowledge_base_id");--> statement-breakpoint
CREATE INDEX "idx_chunks_user_id" ON "chunks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chunks_knowledge_user" ON "chunks" USING btree ("knowledge_base_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_embeddings_chunk_id" ON "embeddings" USING btree ("chunk_id");--> statement-breakpoint
CREATE INDEX "idx_embeddings_user_id" ON "embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_user_id" ON "knowledges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_status" ON "knowledges" USING btree ("status");