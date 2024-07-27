-- AlterEnum
CREATE TYPE "ConfigurationType" AS ENUM ('HomeCareHomeBase', 'WellSky');


ALTER TABLE "Organization" ADD COLUMN "configurationType" "ConfigurationType" NOT NULL DEFAULT 'HomeCareHomeBase';