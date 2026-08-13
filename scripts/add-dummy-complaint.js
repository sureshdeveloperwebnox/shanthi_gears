const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDummyComplaint() {
  try {
    console.log('Adding dummy complaint...');

    // First, get or create a country and territory
    let country = await prisma.$queryRaw`SELECT countryId, countryName FROM Country WHERE countryName = 'India' LIMIT 1`;
    country = Array.isArray(country) ? country[0] : country;

    if (!country) {
      // Create India if it doesn't exist
      const result = await prisma.$executeRaw`INSERT INTO Country (countryName, createdAt, updatedAt) VALUES ('India', NOW(), NOW())`;
      country = await prisma.$queryRaw`SELECT countryId, countryName FROM Country WHERE countryName = 'India' LIMIT 1`;
      country = Array.isArray(country) ? country[0] : country;
      console.log('Created country:', country);
    }

    // Get or create a territory
    let territory = await prisma.territories.findFirst({
      where: { countryId: country.countryId }
    });

    if (!territory) {
      // Create a default territory
      territory = await prisma.territories.create({
        data: {
          territoryName: 'Mumbai',
          countryId: country.countryId,
          status: 'ACTIVE'
        }
      });
      console.log('Created territory:', territory);
    }

    // Generate a unique complaint ID
    const complaintId = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create dummy complaint with all fields filled
    const dummyComplaint = await prisma.complaints.create({
      data: {
        complaintId: complaintId,
        contactPersonName: 'John Doe',
        mailId: 'john.doe@example.com',
        mobileNumber: '+91-9876543210',
        companyName: 'ABC Manufacturing Industries Pvt Ltd',
        territoryId: territory.territoryId,
        countryId: country.countryId,
        gearboxSerialNumber: 'GBX-2024-001234',
        dateOfCommissioning: new Date('2023-01-15'),
        complaintDate: new Date('2024-11-09'),
        applicationDetails: 'Heavy-duty industrial conveyor system for material handling in manufacturing plant. Operating continuously for 16 hours per day with high load requirements.',
        natureOfComplaintWithPhotos: 'Gearbox experiencing excessive noise and vibration during operation. Oil leakage observed from output shaft seal. Temperature rise noticed during extended operation periods. Photos attached showing oil leakage points and gear wear patterns.',
        inputMotorDetailsKw: 75.5,
        inputOutputConnectionDetails: 'Input: Direct coupling with 3-phase induction motor (1500 RPM). Output: Chain drive connection to conveyor system with 1:3 reduction ratio.',
        oilLevelDetails: 'Oil level is at maximum mark. Last checked 2 weeks ago during routine maintenance.',
        gradeOfOilUsed: 'ISO VG 220 Industrial Gear Oil',
        conditionOfOil: 'Oil appears dark brown with slight contamination. Viscosity seems reduced. Sample sent for analysis.',
        conditionOfBreather: 'Breather is clean and functioning properly. No blockages observed.',
        sedimentInOilBottom: 'Minor sediment deposits found at bottom of gearbox. Appears to be metallic particles and sludge.',
        alignmentInputOutput: 'Input and output shafts are properly aligned. Laser alignment check performed - within acceptable tolerance limits.',
        runningHoursPerDay: 16,
        startStopPerDay: 2,
        dismantledBeforeFailure: 'No, gearbox has not been dismantled before this failure. This is the first major issue since installation.',
        ambientConditions: 'Operating temperature: 35-45°C. Humidity: 60-70%. Dusty environment with regular exposure to industrial particles.',
        loadSpectrum: 'Constant heavy load operation (80-90% of rated capacity). Occasional peak loads up to 110% during startup and material surges.',
        forcedLubricationPhotos: 'Forced lubrication system is operational. Photos show proper oil circulation and pump operation. No blockages in lubrication lines.',
        conditionOfOtherParts: 'Gears show signs of wear on teeth surfaces. Bearings appear to be in good condition. Housing shows no cracks or damage. Seals need replacement.',
        lubricationCheckDetails: 'Lubrication system checked and found to be functioning. Oil pump pressure is normal. All lubrication points are receiving adequate oil supply.',
        inputSpeedDetails: 'Input speed: 1500 RPM (constant). Motor running at rated speed with no fluctuations observed.',
        failureHistoryDetails: 'No previous failure history. This is the first major complaint. Regular maintenance has been performed as per schedule. Last maintenance: 3 months ago.'
      }
    });

    console.log('✅ Dummy complaint created successfully!');
    console.log('Complaint ID:', dummyComplaint.complaintId);
    console.log('Company:', dummyComplaint.companyName);
    console.log('Contact:', dummyComplaint.contactPersonName);
    console.log('Email:', dummyComplaint.mailId);

  } catch (error) {
    console.error('❌ Error creating dummy complaint:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addDummyComplaint()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

