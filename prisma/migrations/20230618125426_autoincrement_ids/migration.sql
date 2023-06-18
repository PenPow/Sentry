-- AlterTable
CREATE SEQUENCE moderation_id_seq;
ALTER TABLE "Moderation" ALTER COLUMN "id" SET DEFAULT nextval('moderation_id_seq');
ALTER SEQUENCE moderation_id_seq OWNED BY "Moderation"."id";
