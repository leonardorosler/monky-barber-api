ALTER TABLE "agendamentos" ADD COLUMN "assinatura_id" TEXT;

ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_assinatura_id_fkey"
FOREIGN KEY ("assinatura_id") REFERENCES "assinaturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;