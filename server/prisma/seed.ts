import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pwd: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pwd, salt);
}

// Helper to compute date offset from today
function daysOffset(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d;
}

function weeksOffset(weeks: number): Date {
  return daysOffset(weeks * 7);
}

async function main() {
  console.log('--- Cleaning previous synthetic demonstration data ---');
  // Delete in reverse relational order
  await prisma.auditLog.deleteMany();
  await prisma.parentChangeRequest.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.supportingDocument.deleteMany();
  await prisma.clinicalReview.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.contactAttempt.deleteMany();
  await prisma.followUpTask.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.childImmunizationRecord.deleteMany();
  await prisma.maternalService.deleteMany();
  await prisma.pregnancy.deleteMany();
  await prisma.motherChildRelationship.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.credentialVerification.deleteMany();
  await prisma.clinicianProfile.deleteMany();
  await prisma.healthWorkerProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.healthFacility.deleteMany();
  await prisma.administrativeArea.deleteMany();
  await prisma.vaccine.deleteMany();
  await prisma.immunizationScheduleVersion.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Administrative Geography: Erode District ---');
  const erodeDistrict = await prisma.administrativeArea.create({
    data: {
      name: 'Erode',
      tamilName: 'ஈரோடு',
      type: 'DISTRICT',
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const sathyamangalamBlock = await prisma.administrativeArea.create({
    data: {
      name: 'Sathyamangalam',
      tamilName: 'சத்தியமங்கலம்',
      type: 'BLOCK',
      parentAreaId: erodeDistrict.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const bhavanisagarBlock = await prisma.administrativeArea.create({
    data: {
      name: 'Bhavanisagar',
      tamilName: 'பவானிசாகர்',
      type: 'BLOCK',
      parentAreaId: erodeDistrict.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const gobichettipalayamBlock = await prisma.administrativeArea.create({
    data: {
      name: 'Gobichettipalayam',
      tamilName: 'கோபிசெட்டிபாளையம்',
      type: 'BLOCK',
      parentAreaId: erodeDistrict.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  // Village Panchayats
  const ukkaramVillage = await prisma.administrativeArea.create({
    data: {
      name: 'Ukkaram',
      tamilName: 'உக்கரம்',
      type: 'VILLAGE_PANCHAYAT',
      parentAreaId: sathyamangalamBlock.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const rangasamudramVillage = await prisma.administrativeArea.create({
    data: {
      name: 'Rangasamudram',
      tamilName: 'ரங்கசமுத்திரம்',
      type: 'VILLAGE_PANCHAYAT',
      parentAreaId: sathyamangalamBlock.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const alathucombaiVillage = await prisma.administrativeArea.create({
    data: {
      name: 'Alathucombai',
      tamilName: 'ஆலாத்துக்கோம்பை',
      type: 'VILLAGE_PANCHAYAT',
      parentAreaId: sathyamangalamBlock.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  const rajannagarVillage = await prisma.administrativeArea.create({
    data: {
      name: 'Rajannagar',
      tamilName: 'ராஜன்நகர்',
      type: 'VILLAGE_PANCHAYAT',
      parentAreaId: bhavanisagarBlock.id,
      sourceUrl: 'https://erode.nic.in/development-administration/',
      isVerified: true,
      active: true,
    },
  });

  // Health Facilities
  const sathyGH = await prisma.healthFacility.create({
    data: {
      name: 'Sathyamangalam Government Hospital',
      tamilName: 'சத்தியமங்கலம் அரசு தலைமை மருத்துவமனை',
      type: 'GH',
      areaId: sathyamangalamBlock.id,
      address: 'Hospital Road, Sathyamangalam, Erode - 638402',
      phone: '+91 4295 220022',
    },
  });

  const sathyPHC = await prisma.healthFacility.create({
    data: {
      name: 'Sathyamangalam Upgraded Primary Health Centre',
      tamilName: 'சத்தியமங்கலம் மேம்படுத்தப்பட்ட அரசு ஆரம்ப சுகாதார நிலையம்',
      type: 'PHC',
      areaId: sathyamangalamBlock.id,
      address: 'Main Road, Sathyamangalam',
      phone: '+91 4295 221144',
    },
  });

  const ukkaramPHC = await prisma.healthFacility.create({
    data: {
      name: 'Ukkaram Additional Primary Health Centre',
      tamilName: 'உக்கரம் கூடுதல் ஆரம்ப சுகாதார நிலையம்',
      type: 'PHC',
      areaId: ukkaramVillage.id,
      address: 'Ukkaram Village, Sathyamangalam Taluk',
      phone: '+91 4295 245120',
    },
  });

  const alathucombaiHSC = await prisma.healthFacility.create({
    data: {
      name: 'Alathucombai Health Sub-Centre',
      tamilName: 'ஆலாத்துக்கோம்பை துணை சுகாதார நிலையம்',
      type: 'SUB_CENTRE',
      areaId: alathucombaiVillage.id,
      address: 'Panchayat Office Street, Alathucombai',
      phone: '+91 4295 245990',
    },
  });

  console.log('--- Seeding Vaccine Reference Catalog: NIS Tamil Nadu ---');
  await prisma.immunizationScheduleVersion.create({
    data: {
      versionNumber: 'NIS-TN-2024.1',
      name: 'Tamil Nadu & National Immunization Schedule 2024',
      jurisdiction: 'Tamil Nadu Directorate of Public Health & Family Welfare',
      effectiveDate: new Date('2024-01-01'),
      sourceUrl: 'https://www.tnhealth.org/directorate/dphis.php',
      reviewDate: new Date('2024-03-15'),
      isActive: true,
    },
  });

  const vaccinesData = [
    { code: 'BCG', name: 'BCG', tamilName: 'பிசிஜி', doseNumber: 1, targetAgeWeeks: 0, route: 'Intradermal', site: 'Left upper arm', diseaseTargeted: 'Tuberculosis' },
    { code: 'OPV_0', name: 'OPV-0 (Birth Dose)', tamilName: 'ஓபிவி-0 (பிறப்பு அளவு)', doseNumber: 1, targetAgeWeeks: 0, route: 'Oral', site: 'Oral (2 drops)', diseaseTargeted: 'Poliomyelitis' },
    { code: 'HEPB_0', name: 'Hepatitis B Birth Dose', tamilName: 'ஹெபடைடிஸ் பி (பிறப்பு அளவு)', doseNumber: 1, targetAgeWeeks: 0, route: 'Intramuscular', site: 'Anterolateral aspect of mid thigh', diseaseTargeted: 'Hepatitis B' },
    { code: 'OPV_1', name: 'OPV-1', tamilName: 'ஓபிவி-1', doseNumber: 1, targetAgeWeeks: 6, route: 'Oral', site: 'Oral (2 drops)', diseaseTargeted: 'Poliomyelitis' },
    { code: 'PENTA_1', name: 'Pentavalent-1', tamilName: 'பென்டாவேலண்ட்-1', doseNumber: 1, targetAgeWeeks: 6, route: 'Intramuscular', site: 'Left mid thigh', diseaseTargeted: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib' },
    { code: 'ROTA_1', name: 'Rotavirus-1', tamilName: 'ரோட்டா வைரஸ்-1', doseNumber: 1, targetAgeWeeks: 6, route: 'Oral', site: 'Oral (5 drops)', diseaseTargeted: 'Rotavirus Diarrhoea' },
    { code: 'FIPV_1', name: 'fIPV-1', tamilName: 'எஃப்.ஐ.பி.வி-1', doseNumber: 1, targetAgeWeeks: 6, route: 'Intradermal', site: 'Right upper arm', diseaseTargeted: 'Poliomyelitis' },
    { code: 'PCV_1', name: 'PCV-1', tamilName: 'பி.சி.வி-1 (நியூமோகாக்கல்)', doseNumber: 1, targetAgeWeeks: 6, route: 'Intramuscular', site: 'Right mid thigh', diseaseTargeted: 'Pneumococcal Disease' },
    { code: 'OPV_2', name: 'OPV-2', tamilName: 'ஓபிவி-2', doseNumber: 2, targetAgeWeeks: 10, route: 'Oral', site: 'Oral (2 drops)', diseaseTargeted: 'Poliomyelitis' },
    { code: 'PENTA_2', name: 'Pentavalent-2', tamilName: 'பென்டாவேலண்ட்-2', doseNumber: 2, targetAgeWeeks: 10, route: 'Intramuscular', site: 'Left mid thigh', diseaseTargeted: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib' },
    { code: 'ROTA_2', name: 'Rotavirus-2', tamilName: 'ரோட்டா வைரஸ்-2', doseNumber: 2, targetAgeWeeks: 10, route: 'Oral', site: 'Oral (5 drops)', diseaseTargeted: 'Rotavirus Diarrhoea' },
    { code: 'OPV_3', name: 'OPV-3', tamilName: 'ஓபிவி-3', doseNumber: 3, targetAgeWeeks: 14, route: 'Oral', site: 'Oral (2 drops)', diseaseTargeted: 'Poliomyelitis' },
    { code: 'PENTA_3', name: 'Pentavalent-3', tamilName: 'பென்டாவேலண்ட்-3', doseNumber: 3, targetAgeWeeks: 14, route: 'Intramuscular', site: 'Left mid thigh', diseaseTargeted: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib' },
    { code: 'ROTA_3', name: 'Rotavirus-3', tamilName: 'ரோட்டா வைரஸ்-3', doseNumber: 3, targetAgeWeeks: 14, route: 'Oral', site: 'Oral (5 drops)', diseaseTargeted: 'Rotavirus Diarrhoea' },
    { code: 'FIPV_2', name: 'fIPV-2', tamilName: 'எஃப்.ஐ.பி.வி-2', doseNumber: 2, targetAgeWeeks: 14, route: 'Intradermal', site: 'Right upper arm', diseaseTargeted: 'Poliomyelitis' },
    { code: 'PCV_2', name: 'PCV-2', tamilName: 'பி.சி.வி-2', doseNumber: 2, targetAgeWeeks: 14, route: 'Intramuscular', site: 'Right mid thigh', diseaseTargeted: 'Pneumococcal Disease' },
    { code: 'MR_1', name: 'MR-1 (Measles & Rubella)', tamilName: 'எம்.ஆர்-1 (தட்டம்மை & ரூபெல்லா)', doseNumber: 1, targetAgeWeeks: 39, route: 'Subcutaneous', site: 'Right upper arm', diseaseTargeted: 'Measles and Rubella' },
    { code: 'PCV_BOOSTER', name: 'PCV Booster', tamilName: 'பி.சி.வி பூஸ்டர்', doseNumber: 3, targetAgeWeeks: 39, route: 'Intramuscular', site: 'Right mid thigh', diseaseTargeted: 'Pneumococcal Disease' },
    { code: 'MR_2', name: 'MR-2 (Measles & Rubella)', tamilName: 'எம்.ஆர்-2', doseNumber: 2, targetAgeWeeks: 72, route: 'Subcutaneous', site: 'Right upper arm', diseaseTargeted: 'Measles and Rubella' },
    { code: 'DPT_BOOSTER_1', name: 'DPT Booster-1', tamilName: 'டி.பி.டி பூஸ்டர்-1', doseNumber: 1, targetAgeWeeks: 72, route: 'Intramuscular', site: 'Left mid thigh', diseaseTargeted: 'Diphtheria, Pertussis, Tetanus' },
    { code: 'OPV_BOOSTER', name: 'OPV Booster', tamilName: 'ஓபிவி பூஸ்டர்', doseNumber: 4, targetAgeWeeks: 72, route: 'Oral', site: 'Oral (2 drops)', diseaseTargeted: 'Poliomyelitis' },
    { code: 'DPT_BOOSTER_2', name: 'DPT Booster-2', tamilName: 'டி.பி.டி பூஸ்டர்-2', doseNumber: 2, targetAgeWeeks: 260, route: 'Intramuscular', site: 'Left upper arm', diseaseTargeted: 'Diphtheria, Pertussis, Tetanus' },
    { code: 'TD_10', name: 'Td (10 Years)', tamilName: 'டிடி (10 வயது)', doseNumber: 1, targetAgeWeeks: 520, route: 'Intramuscular', site: 'Upper arm', diseaseTargeted: 'Tetanus and Adult Diphtheria' },
    { code: 'TD_16', name: 'Td (16 Years)', tamilName: 'டிடி (16 வயது)', doseNumber: 2, targetAgeWeeks: 832, route: 'Intramuscular', site: 'Upper arm', diseaseTargeted: 'Tetanus and Adult Diphtheria' },
  ];

  const vaccineMap: Record<string, any> = {};
  for (const v of vaccinesData) {
    const created = await prisma.vaccine.create({ data: v });
    vaccineMap[v.code] = created;
  }

  console.log('--- Seeding Demo User Accounts ---');
  // 1. Parent Account
  const parentPasswordHash = await hash('DemoParent@2026');
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent.demo@materna.local',
      passwordHash: parentPasswordHash,
      role: 'PARENT',
      fullName: 'Kausalya Manickam',
      phone: '+91 94431 82710',
      preferredLanguage: 'ta',
      isActive: true,
      parentProfile: {
        create: {
          address: '14, Mariamman Koil Street, Ukkaram Village',
          village: 'Ukkaram',
          block: 'Sathyamangalam',
          emergencyContact: '+91 98422 11990 (Husband: Manickam)',
        },
      },
    },
    include: { parentProfile: true },
  });

  // 2. Health Worker Account (ASHA / ANM)
  const workerPasswordHash = await hash('DemoWorker@2026');
  const workerUser = await prisma.user.create({
    data: {
      email: 'worker.demo@materna.local',
      passwordHash: workerPasswordHash,
      role: 'HEALTH_WORKER',
      fullName: 'Priya R',
      phone: '+91 98421 55670',
      preferredLanguage: 'ta',
      isActive: true,
      healthWorkerProfile: {
        create: {
          workerCode: 'VHN-SAT-04',
          designation: 'VHN', // Village Health Nurse
          assignedAreaId: ukkaramVillage.id,
          phone: '+91 98421 55670',
        },
      },
    },
    include: { healthWorkerProfile: true },
  });

  // 3. Clinician Account (Doctor - DGO)
  const doctorPasswordHash = await hash('DemoDoctor@2026');
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor.demo@materna.local',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
      fullName: 'Dr. Malathi Sundaram',
      phone: '+91 94422 33440',
      preferredLanguage: 'en',
      isActive: true,
      clinicianProfile: {
        create: {
          dgoQualification: 'MBBS, DGO (Diploma in Gynaecology & Obstetrics)',
          institution: 'Madurai Medical College',
          yearOfQualification: 2014,
          registrationNumber: 'TNMC/DEMO/2014/9812',
          isRegistrationVerified: true, // Marked verified for demo clinician
          facilityId: sathyGH.id,
          consultationHours: '09:00 - 13:00, 14:00 - 16:30',
          breakTimings: JSON.stringify([{ startTime: '13:00', endTime: '14:00' }]),
          biography: 'Senior Consultant Obstetrician and Gynaecologist with 12+ years experience in high-risk obstetric monitoring and rural maternal health in Erode district.',
          languagesSpoken: 'Tamil, English',
          avatarUrl: '/avatars/doctor-malathi.png',
        },
      },
    },
    include: { clinicianProfile: true },
  });

  // Credential verification record for Doctor
  await prisma.credentialVerification.create({
    data: {
      clinicianId: doctorUser.clinicianProfile!.id,
      status: 'VERIFIED',
      notes: 'State Medical Council registration and DGO post-graduate diploma verified against administrative database.',
      verifiedAt: daysOffset(-90),
    },
  });

  // 4. Admin Account
  const adminPasswordHash = await hash('DemoAdmin@2026');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin.demo@materna.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      fullName: 'Dr. S. Karthikeyan (DDHS Erode)',
      phone: '+91 424 2251000',
      preferredLanguage: 'en',
      isActive: true,
    },
  });

  console.log('--- Seeding Synthetic Beneficiaries & Linked Records ---');

  // MOTHER 1: Kausalya (Linked to Demo Parent)
  // Currently 28 weeks pregnant (LMP = 28 weeks ago = -196 days, EDD = +84 days)
  const mother1Lmp = daysOffset(-196);
  const mother1Edd = daysOffset(+84);

  const motherKausalya = await prisma.beneficiary.create({
    data: {
      beneficiaryId: 'TN-ERD-SAT-M001',
      type: 'MOTHER',
      fullName: 'Kausalya Manickam',
      tamilName: 'கௌசல்யா மாணிக்கம்',
      dobOrLmp: mother1Lmp,
      gender: 'FEMALE',
      bloodGroup: 'B+',
      aadharRef: 'XXXX-XXXX-4819',
      rchId: 'TN1209384812',
      address: '14, Mariamman Koil Street, Ukkaram Village',
      villageId: ukkaramVillage.id,
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
      parentUserId: parentUser.id,
    },
  });

  const pregKausalya = await prisma.pregnancy.create({
    data: {
      motherBeneficiaryId: motherKausalya.id,
      lmpDate: mother1Lmp,
      eddDate: mother1Edd,
      gravidity: 2,
      parity: 1,
      highRiskStatus: false,
      riskNotes: 'Normal progression, mild nutritional anaemia monitoring.',
      status: 'ACTIVE',
      registrationDate: daysOffset(-170),
    },
  });

  // Maternal Services for Kausalya:
  // ANC 1: Completed at week 10 (-126 days)
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'ANC_1',
      scheduledDate: daysOffset(-126),
      completedDate: daysOffset(-126),
      status: 'COMPLETED',
      facilityId: ukkaramPHC.id,
      administeredBy: 'Priya R, VHN',
      notes: 'Registration, Hb 10.8 g/dL, BP 110/70 mmHg, Td-1 given.',
      verifiedByUserId: workerUser.id,
      verifiedAt: daysOffset(-126),
    },
  });

  // Td-1: Completed
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'TT_TD_1',
      scheduledDate: daysOffset(-126),
      completedDate: daysOffset(-126),
      status: 'COMPLETED',
      facilityId: ukkaramPHC.id,
      administeredBy: 'Priya R, VHN',
      batchNumber: 'TD24089A',
      verifiedByUserId: workerUser.id,
      verifiedAt: daysOffset(-126),
    },
  });

  // ANC 2: Completed at week 20 (-56 days)
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'ANC_2',
      scheduledDate: daysOffset(-56),
      completedDate: daysOffset(-56),
      status: 'COMPLETED',
      facilityId: sathyGH.id,
      administeredBy: 'Dr. Malathi Sundaram',
      notes: 'Anomaly scan normal. Fundal height matches dates. IFA tablets 100 issued.',
      verifiedByUserId: doctorUser.id,
      verifiedAt: daysOffset(-56),
    },
  });

  // Td-2: Completed at week 20 (-56 days)
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'TT_TD_2',
      scheduledDate: daysOffset(-56),
      completedDate: daysOffset(-56),
      status: 'COMPLETED',
      facilityId: ukkaramPHC.id,
      administeredBy: 'Priya R, VHN',
      batchNumber: 'TD24112B',
      verifiedByUserId: workerUser.id,
      verifiedAt: daysOffset(-56),
    },
  });

  // ANC 3: Scheduled in 3 days (+3 days) -> Trigger advance reminder!
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'ANC_3',
      scheduledDate: daysOffset(+3),
      status: 'SCHEDULED',
      facilityId: ukkaramPHC.id,
      notes: 'Third trimester assessment, Hb recheck, fetal growth check.',
    },
  });

  // ANC 4: Scheduled at week 36 (+56 days)
  await prisma.maternalService.create({
    data: {
      pregnancyId: pregKausalya.id,
      beneficiaryId: motherKausalya.id,
      serviceType: 'ANC_4',
      scheduledDate: daysOffset(+56),
      status: 'SCHEDULED',
      facilityId: sathyGH.id,
      notes: 'Final pre-delivery presentation and institutional birth plan.',
    },
  });

  // CHILD 1: Aarav (Kausalya's first child, born 10 weeks ago = -70 days)
  const child1Dob = daysOffset(-70);
  const childAarav = await prisma.beneficiary.create({
    data: {
      beneficiaryId: 'TN-ERD-SAT-C001',
      type: 'CHILD',
      fullName: 'Aarav Manickam',
      tamilName: 'ஆரவ் மாணிக்கம்',
      dobOrLmp: child1Dob,
      gender: 'MALE',
      bloodGroup: 'B+',
      rchId: 'TN1209384812-C1',
      address: '14, Mariamman Koil Street, Ukkaram Village',
      villageId: ukkaramVillage.id,
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
      parentUserId: parentUser.id,
    },
  });

  await prisma.motherChildRelationship.create({
    data: {
      motherBeneficiaryId: motherKausalya.id,
      childBeneficiaryId: childAarav.id,
      relationshipType: 'BIOLOGICAL',
    },
  });

  // Aarav Immunization Records:
  // Birth Dose vaccines (completed at DOB):
  const birthVaccines = ['BCG', 'OPV_0', 'HEPB_0'];
  for (const code of birthVaccines) {
    if (vaccineMap[code]) {
      await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId: childAarav.id,
          vaccineId: vaccineMap[code].id,
          dueDate: child1Dob,
          administeredDate: child1Dob,
          status: 'COMPLETED',
          facilityId: sathyGH.id,
          administeredBy: 'Sister Jayanthi, Staff Nurse',
          batchLotNumber: `BTH-${code}-2026A`,
          verifiedByUserId: workerUser.id,
          verifiedAt: child1Dob,
        },
      });
    }
  }

  // 6 Weeks vaccines (completed at week 6 = -28 days):
  const sixWeekVaccines = ['OPV_1', 'PENTA_1', 'ROTA_1', 'FIPV_1', 'PCV_1'];
  for (const code of sixWeekVaccines) {
    if (vaccineMap[code]) {
      await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId: childAarav.id,
          vaccineId: vaccineMap[code].id,
          dueDate: daysOffset(-28),
          administeredDate: daysOffset(-28),
          status: 'COMPLETED',
          facilityId: ukkaramPHC.id,
          administeredBy: 'Priya R, VHN',
          batchLotNumber: `6WK-${code}-4418`,
          verifiedByUserId: workerUser.id,
          verifiedAt: daysOffset(-28),
        },
      });
    }
  }

  // 10 Weeks vaccines (DUE TODAY = 0 days!):
  const tenWeekVaccines = ['OPV_2', 'PENTA_2', 'ROTA_2'];
  for (const code of tenWeekVaccines) {
    if (vaccineMap[code]) {
      await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId: childAarav.id,
          vaccineId: vaccineMap[code].id,
          dueDate: daysOffset(0), // DUE TODAY!
          status: 'SCHEDULED',
          facilityId: ukkaramPHC.id,
        },
      });
    }
  }

  // 14 Weeks vaccines (due in 4 weeks = +28 days):
  const fourteenWeekVaccines = ['OPV_3', 'PENTA_3', 'ROTA_3', 'FIPV_2', 'PCV_2'];
  for (const code of fourteenWeekVaccines) {
    if (vaccineMap[code]) {
      await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId: childAarav.id,
          vaccineId: vaccineMap[code].id,
          dueDate: daysOffset(+28),
          status: 'SCHEDULED',
          facilityId: ukkaramPHC.id,
        },
      });
    }
  }

  // MOTHER 2: Revathi S (High-Risk Referral Case)
  // 34 weeks pregnant, Gestational Diabetes, Referred to Dr. Malathi
  const mother2Lmp = daysOffset(-238);
  const mother2Edd = daysOffset(+42);

  const motherRevathi = await prisma.beneficiary.create({
    data: {
      beneficiaryId: 'TN-ERD-SAT-M002',
      type: 'MOTHER',
      fullName: 'Revathi Senthil',
      tamilName: 'ரேவதி செந்தில்',
      dobOrLmp: mother2Lmp,
      gender: 'FEMALE',
      bloodGroup: 'O+',
      aadharRef: 'XXXX-XXXX-9102',
      rchId: 'TN1209384990',
      address: '22, Anna Nagar, Rangasamudram',
      villageId: rangasamudramVillage.id,
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
    },
  });

  const pregRevathi = await prisma.pregnancy.create({
    data: {
      motherBeneficiaryId: motherRevathi.id,
      lmpDate: mother2Lmp,
      eddDate: mother2Edd,
      gravidity: 1,
      parity: 0,
      highRiskStatus: true,
      riskNotes: 'Gestational Diabetes Mellitus (OGTT fasting 108 mg/dL, 2-hr 165 mg/dL). Elevated BP 138/88.',
      status: 'ACTIVE',
      registrationDate: daysOffset(-210),
    },
  });

  // Revathi Follow-up Task
  const taskRevathi = await prisma.followUpTask.create({
    data: {
      taskCode: 'TASK-2026-HR01',
      beneficiaryId: motherRevathi.id,
      serviceType: 'HIGH_RISK_GDM_EVALUATION',
      dueDate: daysOffset(-5),
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
      priority: 'URGENT',
      missedVisitReason: 'Clinical review required',
      contactAttemptsCount: 2,
      lastContactAttemptDate: daysOffset(-2),
      nextAction: 'REFERRAL',
      status: 'REFERRED',
      requiresClinicianApproval: true,
    },
  });

  // Contact attempts for Revathi
  await prisma.contactAttempt.create({
    data: {
      followUpTaskId: taskRevathi.id,
      attemptDate: daysOffset(-4),
      method: 'HOME_VISIT',
      outcome: 'REACHED_PROMISED',
      notes: 'Visited home. Explained sugar test results and importance of specialist review at Sathy GH.',
      workerId: workerUser.id,
    },
  });

  await prisma.contactAttempt.create({
    data: {
      followUpTaskId: taskRevathi.id,
      attemptDate: daysOffset(-2),
      method: 'PHONE_CALL',
      outcome: 'REACHED_PROMISED',
      notes: 'Confirmed caregiver will escort patient to Dr. Malathi consultation.',
      workerId: workerUser.id,
    },
  });

  // Referral to Dr. Malathi for Revathi
  const referralRevathi = await prisma.referral.create({
    data: {
      followUpTaskId: taskRevathi.id,
      beneficiaryId: motherRevathi.id,
      referringWorkerId: workerUser.healthWorkerProfile!.id,
      referredDoctorId: doctorUser.clinicianProfile!.id,
      reason: 'Gestational Diabetes Mellitus (OGTT 165 mg/dL) at 34 weeks gestation. Requires insulin vs dietary therapy planning and biophysical monitoring.',
      priority: 'HIGH_RISK',
      status: 'PENDING',
      referralDate: daysOffset(-2),
    },
  });

  // CHILD 4: Nithya (Overdue Immunization Case with Follow-up task)
  // Born 15 weeks ago (-105 days), 14-week vaccines are OVERDUE by 7 days!
  const child4Dob = daysOffset(-105);
  const childNithya = await prisma.beneficiary.create({
    data: {
      beneficiaryId: 'TN-ERD-SAT-C004',
      type: 'CHILD',
      fullName: 'Nithya Murugan',
      tamilName: 'நித்யா முருகன்',
      dobOrLmp: child4Dob,
      gender: 'FEMALE',
      bloodGroup: 'A+',
      rchId: 'TN1209384772-C1',
      address: '7, Mariamman Street, Alathucombai',
      villageId: alathucombaiVillage.id,
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
    },
  });

  // Completed birth & 6-week & 10-week vaccines for Nithya
  if (vaccineMap['BCG']) {
    await prisma.childImmunizationRecord.create({
      data: {
        childBeneficiaryId: childNithya.id,
        vaccineId: vaccineMap['BCG'].id,
        dueDate: child4Dob,
        administeredDate: child4Dob,
        status: 'COMPLETED',
        facilityId: alathucombaiHSC.id,
        administeredBy: 'Priya R, VHN',
        batchLotNumber: 'BCG2025-09',
        verifiedByUserId: workerUser.id,
        verifiedAt: child4Dob,
      },
    });
  }

  // 14-week vaccines OVERDUE (dueDate = 14 weeks after birth = -7 days ago)
  const fourteenWeekOverdueDate = daysOffset(-7);
  const nithyaOverdueVaccines = ['PENTA_3', 'ROTA_3', 'OPV_3', 'FIPV_2', 'PCV_2'];
  for (const code of nithyaOverdueVaccines) {
    if (vaccineMap[code]) {
      await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId: childNithya.id,
          vaccineId: vaccineMap[code].id,
          dueDate: fourteenWeekOverdueDate,
          status: 'OVERDUE',
          facilityId: alathucombaiHSC.id,
        },
      });
    }
  }

  // Overdue Task for Nithya
  const taskNithya = await prisma.followUpTask.create({
    data: {
      taskCode: 'TASK-2026-IMM04',
      beneficiaryId: childNithya.id,
      serviceType: '14_WEEKS_PENTAVALENT_3_OPV_3',
      dueDate: fourteenWeekOverdueDate,
      assignedWorkerId: workerUser.healthWorkerProfile!.id,
      priority: 'HIGH',
      missedVisitReason: 'Caregiver requested rescheduling',
      contactAttemptsCount: 1,
      lastContactAttemptDate: daysOffset(-2),
      nextAction: 'RESCHEDULE',
      nextFollowUpDate: daysOffset(+4),
      status: 'IN_PROGRESS',
    },
  });

  await prisma.contactAttempt.create({
    data: {
      followUpTaskId: taskNithya.id,
      attemptDate: daysOffset(-2),
      method: 'PHONE_CALL',
      outcome: 'REACHED_PROMISED',
      notes: 'Child had viral cold and mild fever last week. Mother promised to bring child to HSC next Tuesday session.',
      workerId: workerUser.id,
    },
  });

  // Doctor Scheduled Appointments for Demo
  // 1. Today 10:00 - 10:30 (Scheduled)
  await prisma.appointment.create({
    data: {
      doctorId: doctorUser.clinicianProfile!.id,
      beneficiaryId: motherRevathi.id,
      scheduledDate: daysOffset(0),
      startTime: '10:00',
      endTime: '10:30',
      status: 'SCHEDULED',
      consultationType: 'HIGH_RISK_REFERRAL',
      notes: 'Specialist GDM evaluation and dietary/insulin management.',
      createdByUserId: workerUser.id,
    },
  });

  // 2. Today 11:00 - 11:30 (Scheduled)
  await prisma.appointment.create({
    data: {
      doctorId: doctorUser.clinicianProfile!.id,
      beneficiaryId: motherKausalya.id,
      scheduledDate: daysOffset(0),
      startTime: '11:00',
      endTime: '11:30',
      status: 'SCHEDULED',
      consultationType: 'ANTENATAL_CHECKUP',
      notes: 'Third trimester ultrasound consultation.',
      createdByUserId: workerUser.id,
    },
  });

  // Reminders Sample
  await prisma.reminder.create({
    data: {
      beneficiaryId: motherKausalya.id,
      serviceType: 'ANC_3',
      targetDueDate: daysOffset(+3),
      reminderType: 'ADVANCE_3_DAYS',
      channel: 'SMS',
      status: 'SIMULATED_SENT',
      scheduledFor: daysOffset(0),
      sentAt: daysOffset(0),
      contentEn: 'MaternaTrack: Antenatal Checkup 3 is due on ' + daysOffset(+3).toLocaleDateString('en-IN') + '. Visit Ukkaram PHC.',
      contentTa: 'மதர்னாட்ராக்: கர்ப்பகால பரிசோதனை 3 நாள் ' + daysOffset(+3).toLocaleDateString('ta-IN') + '. உக்கரம் ஆரம்ப சுகாதார நிலையத்தை அணுகவும்.',
    },
  });

  await prisma.reminder.create({
    data: {
      beneficiaryId: childAarav.id,
      serviceType: 'Pentavalent-2 & OPV-2',
      targetDueDate: daysOffset(0),
      reminderType: 'DUE_TODAY',
      channel: 'SMS',
      status: 'SIMULATED_SENT',
      scheduledFor: daysOffset(0),
      sentAt: daysOffset(0),
      contentEn: 'MaternaTrack: Aarav is DUE TODAY for 10-week vaccines (Pentavalent-2, OPV-2, Rotavirus-2).',
      contentTa: 'மதர்னாட்ராக்: ஆரவ் குழந்தைக்கு இன்று 10-வார தடுப்பூசிகள் நாள் (பென்டாவேலண்ட்-2, ஓபிவி-2).',
    },
  });

  console.log('--- Seeding Articles & Pink Announcement Ticker Items ---');
  // 6 Announcement Tickers
  const tickerItems = [
    {
      slug: 'anc-timely-visits',
      titleEn: 'Pregnancy care begins with timely antenatal visits',
      titleTa: 'முறையான கர்ப்பகால பரிசோதனைகளுடன் ஆரோக்கியமான தாய்மை தொடக்கம்',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'Early registration within 12 weeks ensures critical risk assessment and vital nutrient supplementation.',
      summaryTa: '12 வாரங்களுக்குள் கர்ப்ப பதிவு செய்வது தாய்க்கும் குழந்தைக்கும் அத்தியாவசிய ஊட்டச்சத்து மற்றும் பாதுகாப்பை உறுதி செய்கிறது.',
      contentEn: 'Antenatal care (ANC) is the cornerstone of maternal and newborn health. The Ministry of Health and Family Welfare (MOHFW) recommends at least four focused visits starting in the first trimester. Timely check-ups screen for hypertension, pre-eclampsia, gestational diabetes, and anaemia, while ensuring Td immunization and iron-folic acid (IFA) distribution.',
      contentTa: 'தாய் சேய் நல்வாழ்வில் கர்ப்பகால பரிசோதனைகள் மிக முக்கிய பங்கு வகிக்கின்றன. குறைந்தது 4 விரிவான மருத்துவ பரிசோதனைகள் பரிந்துரைக்கப்படுகின்றன. இதன் மூலம் ரத்த அழுத்தம், சர்க்கரை அளவு மற்றும் ரத்த சோகை போன்றவை முன்கூட்டியே கண்டறியப்பட்டு உரிய சிகிச்சை அளிக்கப்படுகிறது.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2024-02-15'),
    },
    {
      slug: 'mcp-card-records',
      titleEn: 'Keep your Mother and Child Protection card and vaccination records updated',
      titleTa: 'தாய் சேய் பாதுகாப்பு அட்டை மற்றும் தடுப்பூசி பதிவுகளை புதுப்பித்து வைக்கவும்',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'The MCP card tracks vital growth milestones, maternal immunizations, and institutional delivery records.',
      summaryTa: 'எம்.சி.பி அட்டை குழந்தையின் வளர்ச்சி மற்றும் தடுப்பூசி பதிவுகளை கண்காணிக்க உதவுகிறது.',
      contentEn: 'The Mother and Child Protection (MCP) card serves as a permanent healthcare passport for the mother and her child. In Tamil Nadu, all clinical services, ultrasound scans, iron supplements, and childhood vaccinations are verified and recorded on this card by Village Health Nurses (VHNs) and medical officers.',
      contentTa: 'தாய் சேய் பாதுகாப்பு அட்டை என்பது ஒவ்வொரு தாய் மற்றும் குழந்தையின் முழுமையான மருத்துவ ஆவணமாகும். கிராம சுகாதார செவிலியர்கள் மற்றும் மருத்துவர்கள் இதில் பதிவுகளை சரிபார்த்து பதிவு செய்கின்றனர்.',
      sourceUrl: 'https://www.tnhealth.org/directorate/dphis.php',
      reviewDate: new Date('2024-01-20'),
    },
    {
      slug: 'newborn-immunization-birth',
      titleEn: 'Newborn immunization begins at birth with BCG, OPV-0, and Hepatitis B',
      titleTa: 'பிறந்தவுடன் பிசிஜி, ஓபிவி-0 மற்றும் ஹெபடைடிஸ் பி தடுப்பூசிகள் போடப்பட வேண்டும்',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'Birth doses provide immediate defense against tuberculosis, polio, and mother-to-child hepatitis transmission.',
      summaryTa: 'பிறந்த உடனேயே வழங்கப்படும் தடுப்பூசிகள் தீவிர நோய்த்தொற்றுகளிலிருந்து பாதுகாப்பை அளிக்கின்றன.',
      contentEn: 'Administering BCG, Oral Polio Vaccine (OPV-0), and Hepatitis B birth dose within 24-48 hours of birth is essential for newborn survival. Tamil Nadu achieves over 99% institutional delivery rate, ensuring almost all newborns receive their birth dose before hospital discharge.',
      contentTa: 'குழந்தை பிறந்த 24-48 மணி நேரத்திற்குள் பிசிஜி, போலியோ சொட்டு மருந்து மற்றும் ஹெபடைடிஸ் பி தடுப்பூசி போடுவது கட்டாயமாகும். தமிழ்நாட்டில் அரசு மருத்துவமனைகளில் இது முறையாக வழங்கப்படுகிறது.',
      sourceUrl: 'https://www.mohfw.gov.in/sites/default/files/Universal.pdf',
      reviewDate: new Date('2024-02-01'),
    },
    {
      slug: 'missed-visit-recovery',
      titleEn: 'Missed a scheduled visit? Contact your health worker to plan the next step',
      titleTa: 'தவறிய பரிசோதனையா? உடனே உங்கள் சுகாதாரப் பணியாளரைத் தொடர்பு கொள்ளவும்',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'Do not wait or skip doses. MaternaTrack follow-up workflows reconnect you with your community nurse.',
      summaryTa: 'தவறிய தடுப்பூசியை கைவிடாமல், உங்கள் ஆஷா செவிலியர் மூலம் மாற்று தேதியை நிர்ணயிக்கவும்.',
      contentEn: 'Delays in vaccination or antenatal visits increase vulnerability to preventable illnesses. If an appointment is missed, MaternaTrack generates an accountable follow-up task for the assigned ASHA or VHN worker to reach out, understand the cause, and coordinate a safe reschedule.',
      contentTa: 'தடுப்பூசி தாமதமானால் நோய்த்தொற்று ஏற்படும் அபாயம் அதிகம். மதர்னாட்ராக் அமைப்பில் தவறிய நிகழ்வுகள் உடனடியாக சுகாதார பணியாளருக்கு தெரியப்படுத்தப்பட்டு மாற்று ஏற்பாடுகள் செய்யப்படுகின்றன.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2024-03-05'),
    },
    {
      slug: 'verified-vaccine-history',
      titleEn: 'Your child’s next vaccine date depends on verified vaccination history',
      titleTa: 'குழந்தையின் அடுத்த தடுப்பூசி நாள் சரிபார்க்கப்பட்ட பதிவுகளின் அடிப்படையில் அமைகிறது',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'Schedule engines use verified dates and minimum age windows to calculate safe subsequent doses.',
      summaryTa: 'தடுப்பூசிகளுக்கு இடையே உள்ள கால இடைவெளியை கணக்கிட்டு அடுத்த நாள் நிர்ணயிக்கப்படுகிறது.',
      contentEn: 'Every vaccine in the National Immunization Schedule requires a biologically determined minimum interval (e.g., 4 weeks between Pentavalent doses). MaternaTrack prevents premature or duplicate dosing by calculating future due dates strictly from verified administration dates.',
      contentTa: 'இரண்டு தடுப்பூசிகளுக்கு இடையே குறிப்பிட்ட கால இடைவெளி (குறைந்தது 4 வாரங்கள்) இருக்க வேண்டும். மதர்னாட்ராக் தளத்தில் துல்லியமான விதிகள் மூலம் அடுத்த தேதி பாதுகாப்பாக கணக்கிடப்படுகிறது.',
      sourceUrl: 'https://www.who.int/',
      reviewDate: new Date('2024-01-10'),
    },
    {
      slug: 'multilingual-health-access',
      titleEn: 'Choose your language for accessible maternal and child health information',
      titleTa: 'தாய் சேய் நல்வாழ்வு தகவல்களை தமிழ் மற்றும் ஆங்கிலத்தில் அணுகவும்',
      category: 'TICKER_ANNOUNCEMENT',
      summaryEn: 'MaternaTrack provides full localization in Tamil and English, plus voice-guided assistance via Materna Voice.',
      summaryTa: 'மதர்னாட்ராக் தளம் தமிழ் மற்றும் ஆங்கிலத்தில் முழுமையான ஆதரவையும் குரல் வழிகாட்டியையும் வழங்குகிறது.',
      contentEn: 'Language must never be a barrier to lifesaving healthcare guidance. MaternaTrack offers real-time English and Tamil interface switching, translated clinical reminders, and Materna Voice conversational guidance grounded in official public health sources.',
      contentTa: 'மொழி தடைகளை நீக்கி, தாய்மார்கள் தங்கள் தாய்மொழியிலேயே அனைத்து சுகாதார தகவல்களையும் தெரிந்து கொள்ள மதர்னாட்ராக் உதவுகிறது.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2026-01-01'),
    },
  ];

  for (const item of tickerItems) {
    await prisma.article.create({ data: item });
  }

  // Historical Timeline Milestones
  const historicalMilestones = [
    {
      slug: 'milestone-community-knowledge',
      titleEn: 'Traditional Community Practices & Birth Attendance',
      titleTa: 'பாரம்பரிய சமூக மருத்துவ முறைகள் மற்றும் பிரசவ உதவி',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'Traditional home-based childbirth and community-based herbal support in rural villages.',
      summaryTa: 'கிராமப்புறங்களில் பாரம்பரிய முறையில் மேற்கொள்ளப்பட்ட பிரசவங்கள் மற்றும் சமூக அறிவு.',
      contentEn: 'Before modern clinical infrastructure, rural communities relied on experienced traditional birth attendants (Dais) and family matriarchs. While offering culturally compassionate care, high-risk complications like postpartum haemorrhage and neonatal tetanus carried significant maternal and infant mortality risks.',
      contentTa: 'நவீன மருத்துவ வசதிகள் வருவதற்கு முன்பு, கிராமங்களில் அனுபவமிக்க பாரம்பரிய மருத்துவச்சிகள் மூலம் பிரசவங்கள் நடைபெற்றன. இதில் அவசர கால மருத்துவ சிக்கல்களை கையாள்வது சவாலாக இருந்தது.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2024-01-01'),
    },
    {
      slug: 'milestone-trained-attendance',
      titleEn: 'Expansion of Trained Birth Attendance & Primary Care',
      titleTa: 'பயிற்சி பெற்ற மருத்துவச்சிகள் மற்றும் ஆரம்ப சுகாதார விரிவாக்கம்',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'Establishment of Primary Health Centres and training of Auxiliary Nurse Midwives (ANMs).',
      summaryTa: 'ஆரம்ப சுகாதார நிலையங்கள் மற்றும் துணை செவிலியர் மருத்துவச்சிகளுக்கான பயிற்சி தொடக்கம்.',
      contentEn: 'In the mid-20th century, India expanded Primary Health Centres (PHCs) and formal training for ANMs. Sterile cord cutting and clean birth practices drastically reduced neonatal tetanus rates across rural districts.',
      contentTa: 'இருபதாம் நூற்றாண்டின் மத்தியில் அரசு ஆரம்ப சுகாதார நிலையங்களை அமைத்து, செவிலியர்களுக்கு முறையான நவீன பயிற்சி வழங்கி பாதுகாப்பான பிரசவங்களை ஊக்குவித்தது.',
      sourceUrl: 'https://www.mohfw.gov.in/',
      reviewDate: new Date('2024-01-01'),
    },
    {
      slug: 'milestone-uip-immunization',
      titleEn: 'Universal Immunization Programme (1985)',
      titleTa: 'அனைத்து குழந்தைகளுக்குமான தேசிய தடுப்பூசி திட்டம் (1985)',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'Nationwide immunization rollout targeting six vaccine-preventable killer diseases.',
      summaryTa: 'ஆறு கொடிய நோய்களிலிருந்து குழந்தைகளை காக்கும் மாபெரும் தேசிய தடுப்பூசி திட்டம்.',
      contentEn: 'Launched in 1985, the Universal Immunization Programme (UIP) established cold chain infrastructure across all states, supplying free vaccines for polio, measles, diphtheria, pertussis, tetanus, and tuberculosis.',
      contentTa: '1985-ல் தொடங்கப்பட்ட தேசிய தடுப்பூசி திட்டம், போலியோ, தட்டம்மை, தொண்டை அடைப்பான் போன்ற கொடிய நோய்களைக் கட்டுப்படுத்த இலவச தடுப்பூசி விநியோகத்தை உறுதி செய்தது.',
      sourceUrl: 'https://www.mohfw.gov.in/sites/default/files/Universal.pdf',
      reviewDate: new Date('2024-01-01'),
    },
    {
      slug: 'milestone-community-mobilization',
      titleEn: 'Community Mobilization by ASHA & VHN Workers (2005)',
      titleTa: 'ஆஷா மற்றும் கிராம சுகாதார செவிலியர்கள் இயக்கம் (2005)',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'National Health Mission introduces accredited community health activists.',
      summaryTa: 'தேசிய நல்வாழ்வு திட்டத்தின் கீழ் கிராமப்புற சமூக சுகாதார பணியாளர்கள் நியமனம்.',
      contentEn: 'The National Rural Health Mission deployed over one million ASHA workers, connecting rural households directly to public health centres for antenatal registration, institutional delivery, and child immunization tracking.',
      contentTa: 'ஆஷா மற்றும் கிராம செவிலியர்கள் ஒவ்வொரு கிராமத்து வீடுகளுக்கும் நேரடியாக சென்று கர்ப்பிணிகளையும் குழந்தைகளையும் தொடர்ந்து கண்காணிக்கும் பணிகளை மேற்கொண்டனர்.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2024-01-01'),
    },
    {
      slug: 'milestone-digital-rch',
      titleEn: 'Digitization & Mother-Child Tracking (MCTS/RCH)',
      titleTa: 'டிஜிட்டல் தாய் சேய் கண்காணிப்பு முறை (MCTS/RCH)',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'Introduction of web-based beneficiary tracking and unique RCH ID identification.',
      summaryTa: 'இணையவழி தனித்துவ அடையாள எண் மூலம் தாய் சேய் பதிவுகளை கண்காணித்தல்.',
      contentEn: 'The introduction of MCTS and RCH portals digitized beneficiary registries, enabling electronic scheduling of immunization sessions and automated SMS reminders to parents.',
      contentTa: 'தாய் மற்றும் குழந்தைக்கு தனித்துவ அடையாள எண் வழங்கப்பட்டு, கணினி மூலம் தடுப்பூசி மற்றும் மருத்துவ வருகைகள் கண்காணிக்கப்பட்டன.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2024-01-01'),
    },
    {
      slug: 'milestone-maternatrack-continuity',
      titleEn: 'Accountable Follow-up & Verified Completion: MaternaTrack (2026)',
      titleTa: 'சரிபார்க்கப்பட்ட பராமரிப்பு மற்றும் தொடர் பின்தொடர்தல்: மதர்னாட்ராக் (2026)',
      category: 'HISTORICAL_MILESTONE',
      summaryEn: 'Closing the gap: Connecting reminders with accountable task management and clinical verification.',
      summaryTa: 'நினைவூட்டல் மட்டுமல்லாமல், பணியாளர்களின் ஒருங்கிணைப்புடன் உறுதி செய்யப்பட்ட பராமரிப்பு.',
      contentEn: 'MaternaTrack advances beyond mere passive reminders by linking parents, health workers, and specialist clinicians. Every missed visit generates accountable follow-up workflows, verifiable clinical records, and bilingual accessibility for complete care continuity.',
      contentTa: 'மதர்னாட்ராக் நினைவூட்டலுடன் நின்றுவிடாமல், விடுபட்ட ஒவ்வொரு பரிசோதனையையும் சுகாதார பணியாளர்கள் மற்றும் மருத்துவர்களின் ஒருங்கிணைப்பு மூலம் சரிபார்க்கப்பட்ட சேவையாக மாற்றுகிறது.',
      sourceUrl: 'https://rmnch.mohfw.gov.in/',
      reviewDate: new Date('2026-01-01'),
    },
  ];

  for (const milestone of historicalMilestones) {
    await prisma.article.create({ data: milestone });
  }

  console.log('===========================================================');
  console.log(' SEED COMPLETE: MaternaTrack Synthetic Demonstration Data');
  console.log('===========================================================');
  console.log(' Demo Accounts:');
  console.log('   Parent:        parent.demo@materna.local  / DemoParent@2026');
  console.log('   Health Worker: worker.demo@materna.local  / DemoWorker@2026');
  console.log('   Doctor:        doctor.demo@materna.local  / DemoDoctor@2026');
  console.log('   Admin:         admin.demo@materna.local   / DemoAdmin@2026');
  console.log(' Region: Sathyamangalam, Erode District, Tamil Nadu');
  console.log(' Synthetic Beneficiaries, Vaccines, Follow-ups, and Articles created.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
