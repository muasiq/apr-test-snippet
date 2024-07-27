-- CreateEnum
CREATE TYPE "ConfigurationType" AS ENUM ('HomeCareHomeBase', 'WellSky');

-- CreateEnum
CREATE TYPE "PayorSourceType" AS ENUM ('Pharmacy', 'Medicaid', 'Medicare', 'Bereavement', 'CommercialInsurance', 'SelfPay', 'Charity', 'OtherPDGMPayors', 'RoomAndBoard', 'ManagedMedicareFFS', 'ManagedMedicaid', 'WorkersComp', 'MedicaidAdvantage', 'MedicareAdvantage', 'ClaimCodesPartBBilling');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('AccentraHomeHealthToHospiceTransfer', 'AccentraHospiceToHomeHealth', 'AccentraOfficeTransfer', 'AdoptedChild', 'Aunt', 'Brother', 'BrotherInLaw', 'ChildInsuredDoesNotHaveFinancialResponsibility', 'ChildInsuredHasFinancialResponsibility', 'Cousin', 'Daughter', 'DaughterInLaw', 'DomesticPartner', 'Employee', 'Father', 'FosterChild', 'Friend', 'Grandaughter', 'Grandfather', 'Grandmother', 'Grandson', 'Guardian', 'HandicappedDependent', 'LifePartner', 'Mother', 'Neighbor', 'Nephew', 'Niece', 'Other', 'PaidCaregiver', 'PaidCaregiverNonFamilial', 'Self', 'SignificantOther', 'Sister', 'SisterInLaw', 'Son', 'SonInLaw', 'SponsoredDependent', 'Spouse', 'Stepchild', 'Uncle', 'Unknown', 'Ward');

-- CreateEnum
CREATE TYPE "PatientArtifactTag" AS ENUM ('ReferralDocument', 'Wounds', 'Medication', 'Other', 'Photos');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Nurse', 'BackOffice', 'Coordinator', 'Admin', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "OasisAnswerSuggestionStatus" AS ENUM ('Queued', 'InProgress', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "QuestionSources" AS ENUM ('Oasis', 'PhysicalAssessment', 'Pathways', 'Master', 'Custom');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('PrimaryCareProvider', 'ReferringPhysician', 'OtherFollowingPhysician');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('Facility', 'Hospital', 'Clinic', 'Other');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('NewPatient', 'Incomplete', 'WithQA', 'SignoffNeeded', 'Complete');

-- CreateEnum
CREATE TYPE "PatientArtifactStatus" AS ENUM ('ExtractionNotStarted', 'ExtractionStarted', 'ExtractionCompleted', 'ExtractionFailed');

-- CreateEnum
CREATE TYPE "AudioTranscriptionStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY');

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emailDomains" TEXT[],
    "configurationType" "ConfigurationType" NOT NULL DEFAULT 'HomeCareHomeBase',

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "assignedUserId" TEXT,
    "locationId" INTEGER,
    "SOCVisitDate" TIMESTAMP(3),
    "SOCVisitCaseManagerId" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "gender" "Gender",
    "mobilePhoneNumber" TEXT,
    "patientReferralSourceId" INTEGER,
    "phoneNumber" TEXT,
    "primaryDiagnosis" TEXT,
    "state" "State",
    "status" "PatientStatus" NOT NULL DEFAULT 'NewPatient',
    "zip" TEXT,
    "nurseSignOffName" TEXT,
    "nurseSignOffDate" TIMESTAMP(3),
    "payorSourceId" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseConfirmedOasisSections" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "section" TEXT NOT NULL,

    CONSTRAINT "NurseConfirmedOasisSections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayorSource" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payorSourceName" TEXT,
    "payorSourceType" "PayorSourceType",
    "payorSourceIdentifier" TEXT,

    CONSTRAINT "PayorSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecondaryDiagnoses" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,

    CONSTRAINT "SecondaryDiagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientReferralSource" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referralDate" TIMESTAMP(3),
    "facilityName" TEXT,
    "facilityType" "FacilityType",
    "contactName" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "PatientReferralSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAssociatedPhysician" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "providerType" "ProviderType",
    "institution" TEXT,
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "PatientAssociatedPhysician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientEmergencyContact" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "relationship" "Relationship",

    CONSTRAINT "PatientEmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientArtifact" (
    "id" SERIAL NOT NULL,
    "cloudStorageLocation" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "tagName" "PatientArtifactTag" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" INTEGER NOT NULL,
    "userThatUploadedId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PatientArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocumentArtifact" (
    "id" SERIAL NOT NULL,
    "documentRawText" TEXT,
    "documentExtractionOutputLocation" TEXT,
    "relevantPages" INTEGER[],
    "status" "PatientArtifactStatus" NOT NULL DEFAULT 'ExtractionCompleted',
    "extractionAttempts" INTEGER NOT NULL DEFAULT 0,
    "patientArtifactId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDocumentArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paragraph" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startIndex" INTEGER NOT NULL,
    "endIndex" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "positionOnPage" INTEGER NOT NULL,
    "patientDocumentArtifactId" INTEGER NOT NULL,

    CONSTRAINT "Paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "organizationId" INTEGER NOT NULL,
    "emailVerified" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Nurse',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "NurseInterviewThemeSummaries" (
    "id" SERIAL NOT NULL,
    "nurseInterviewId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "NurseInterviewThemeSummaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseInterviewQuestionItem" (
    "id" SERIAL NOT NULL,
    "NurseInterviewThemeSummaryId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "LLMSummarizedText" TEXT[],
    "humanConfirmedSummarizedText" TEXT,

    CONSTRAINT "NurseInterviewQuestionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseInterview" (
    "id" SERIAL NOT NULL,
    "selectedThemesToReportOn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "distanceTraveled" INTEGER,
    "minutesSpentWithPatient" INTEGER,
    "minutesSpentDriving" INTEGER,
    "totalWounds" INTEGER,
    "hasCompletedWoundPhotoUpload" BOOLEAN DEFAULT false,
    "hasCompletedMedicationPhotoUpload" BOOLEAN DEFAULT false,
    "hasCompletedDocumentsUpload" BOOLEAN DEFAULT false,
    "hasCompletedOtherPhotoUpload" BOOLEAN DEFAULT false,
    "hasConfirmedThemesWithinNormalLimits" BOOLEAN DEFAULT false,
    "userId" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NurseInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "cloudStorageAudioFileLocation" TEXT,
    "audioContentType" TEXT,
    "audioTranscriptionStatus" "AudioTranscriptionStatus",
    "transcribedText" TEXT,
    "textResponse" TEXT,
    "patientId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewQuestionShortLabel" TEXT NOT NULL,
    "interviewQuestionTheme" TEXT NOT NULL,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OasisAnswer" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "source" "QuestionSources" NOT NULL DEFAULT 'Oasis',
    "oasisNumber" TEXT NOT NULL,
    "status" "OasisAnswerSuggestionStatus" NOT NULL DEFAULT 'InProgress',
    "generatedResponse" JSONB,
    "generatedResponseAccepted" BOOLEAN,
    "checkedResponse" JSONB,
    "checkedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OasisAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientReferralSourceId_key" ON "Patient"("patientReferralSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_payorSourceId_key" ON "Patient"("payorSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_organizationId_firstName_lastName_dateOfBirth_key" ON "Patient"("organizationId", "firstName", "lastName", "dateOfBirth");

-- CreateIndex
CREATE UNIQUE INDEX "NurseConfirmedOasisSections_patientId_section_key" ON "NurseConfirmedOasisSections"("patientId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "PatientArtifact_cloudStorageLocation_key" ON "PatientArtifact"("cloudStorageLocation");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDocumentArtifact_documentExtractionOutputLocation_key" ON "PatientDocumentArtifact"("documentExtractionOutputLocation");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDocumentArtifact_patientArtifactId_key" ON "PatientDocumentArtifact"("patientArtifactId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "NurseInterviewThemeSummaries_nurseInterviewId_theme_key" ON "NurseInterviewThemeSummaries"("nurseInterviewId", "theme");

-- CreateIndex
CREATE UNIQUE INDEX "NurseInterviewQuestionItem_NurseInterviewThemeSummaryId_que_key" ON "NurseInterviewQuestionItem"("NurseInterviewThemeSummaryId", "question");

-- CreateIndex
CREATE UNIQUE INDEX "NurseInterview_patientId_key" ON "NurseInterview"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewQuestion_patientId_interviewQuestionShortLabel_key" ON "InterviewQuestion"("patientId", "interviewQuestionShortLabel");

-- CreateIndex
CREATE UNIQUE INDEX "OasisAnswer_patientId_oasisNumber_source_key" ON "OasisAnswer"("patientId", "oasisNumber", "source");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_SOCVisitCaseManagerId_fkey" FOREIGN KEY ("SOCVisitCaseManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_patientReferralSourceId_fkey" FOREIGN KEY ("patientReferralSourceId") REFERENCES "PatientReferralSource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_payorSourceId_fkey" FOREIGN KEY ("payorSourceId") REFERENCES "PayorSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseConfirmedOasisSections" ADD CONSTRAINT "NurseConfirmedOasisSections_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecondaryDiagnoses" ADD CONSTRAINT "SecondaryDiagnoses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PatientAssociatedPhysician" ADD CONSTRAINT "PatientAssociatedPhysician_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PatientEmergencyContact" ADD CONSTRAINT "PatientEmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PatientArtifact" ADD CONSTRAINT "PatientArtifact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PatientArtifact" ADD CONSTRAINT "PatientArtifact_userThatUploadedId_fkey" FOREIGN KEY ("userThatUploadedId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PatientDocumentArtifact" ADD CONSTRAINT "PatientDocumentArtifact_patientArtifactId_fkey" FOREIGN KEY ("patientArtifactId") REFERENCES "PatientArtifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_patientDocumentArtifactId_fkey" FOREIGN KEY ("patientDocumentArtifactId") REFERENCES "PatientDocumentArtifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseInterviewThemeSummaries" ADD CONSTRAINT "NurseInterviewThemeSummaries_nurseInterviewId_fkey" FOREIGN KEY ("nurseInterviewId") REFERENCES "NurseInterview"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NurseInterviewQuestionItem" ADD CONSTRAINT "NurseInterviewQuestionItem_NurseInterviewThemeSummaryId_fkey" FOREIGN KEY ("NurseInterviewThemeSummaryId") REFERENCES "NurseInterviewThemeSummaries"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NurseInterview" ADD CONSTRAINT "NurseInterview_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NurseInterview" ADD CONSTRAINT "NurseInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OasisAnswer" ADD CONSTRAINT "OasisAnswer_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OasisAnswer" ADD CONSTRAINT "OasisAnswer_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

