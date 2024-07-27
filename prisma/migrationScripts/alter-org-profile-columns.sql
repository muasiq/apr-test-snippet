
  ALTER TABLE "Patient" ALTER COLUMN "serviceLocationType" TYPE text;

  ALTER TABLE "PatientEmergencyContact" ALTER COLUMN "relationship" TYPE text;

  ALTER TABLE "PatientEmergencyContact" ALTER COLUMN "availability" TYPE text[];

  ALTER TABLE "PatientEmergencyContact" ALTER COLUMN "type" TYPE text[];

  ALTER TABLE "PatientPayorSource" ALTER COLUMN "payorSourceType" TYPE text;

  ALTER TABLE "PatientReferralSource" ALTER COLUMN "facilityType" TYPE text;