const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

const users = [
  // Students
  { email: "student1@example.com", password: "password123", fullName: "Budi Santoso", role: "STUDENT", phoneNumber: "081234567891" },
  { email: "student2@example.com", password: "password123", fullName: "Siti Aminah", role: "STUDENT", phoneNumber: "081234567892" },
  { email: "student3@example.com", password: "password123", fullName: "Rizky Febian", role: "STUDENT", phoneNumber: "081234567893" },
  { email: "student4@example.com", password: "password123", fullName: "Dewi Persik", role: "STUDENT", phoneNumber: "081234567894" },
  { email: "student5@example.com", password: "password123", fullName: "Ahmad Dhani", role: "STUDENT", phoneNumber: "081234567895" },
  { email: "student6@example.com", password: "password123", fullName: "Raisa Andriana", role: "STUDENT", phoneNumber: "081234567896" },
  { email: "student7@example.com", password: "password123", fullName: "Isyana Sarasvati", role: "STUDENT", phoneNumber: "081234567897" },
  { email: "student8@example.com", password: "password123", fullName: "Tulus Rusydi", role: "STUDENT", phoneNumber: "081234567898" },
  { email: "student9@example.com", password: "password123", fullName: "Agnez Mo", role: "STUDENT", phoneNumber: "081234567899" },
  { email: "student10@example.com", password: "password123", fullName: "Glenn Fredly", role: "STUDENT", phoneNumber: "081234567800" },

  // Parents
  { email: "parent1@example.com", password: "password123", fullName: "Bapak Budi", role: "PARENT", phoneNumber: "08111111111" },
  { email: "parent2@example.com", password: "password123", fullName: "Ibu Siti", role: "PARENT", phoneNumber: "08111111112" },
  { email: "parent3@example.com", password: "password123", fullName: "Bapak Rizky", role: "PARENT", phoneNumber: "08111111113" },
  { email: "parent4@example.com", password: "password123", fullName: "Ibu Dewi", role: "PARENT", phoneNumber: "08111111114" },
  { email: "parent5@example.com", password: "password123", fullName: "Bapak Ahmad", role: "PARENT", phoneNumber: "08111111115" },
  { email: "parent6@example.com", password: "password123", fullName: "Ibu Raisa", role: "PARENT", phoneNumber: "08111111116" },
  { email: "parent7@example.com", password: "password123", fullName: "Bapak Isyana", role: "PARENT", phoneNumber: "08111111117" },

  // Coaches
  { email: "coach1@example.com", password: "password123", fullName: "Coach Shin Tae-yong", role: "COACH", phoneNumber: "08222222221" },
  { email: "coach2@example.com", password: "password123", fullName: "Coach Indra Sjafri", role: "COACH", phoneNumber: "08222222222" },
  { email: "coach3@example.com", password: "password123", fullName: "Coach Bima Sakti", role: "COACH", phoneNumber: "08222222223" },
  { email: "coach4@example.com", password: "password123", fullName: "Coach Nova Arianto", role: "COACH", phoneNumber: "08222222224" }
];

async function seed() {
  console.log("Starting DB Seed...");
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`[OK] Created: ${user.fullName} (${user.role})`);
        successCount++;
      } else {
        console.log(`[FAIL] ${user.fullName}: ${data.message || response.statusText}`);
         // If fail because already email exist, it's fine
         if (JSON.stringify(data).includes("email")) failCount++; // Assuming error structure
      }
    } catch (e) {
      console.error(`[ERR] ${user.fullName}:`, e.message);
      failCount++;
    }
  }

  console.log(`\nSeeding Complete. Success: ${successCount}, Failed/Exist: ${failCount}`);
}

seed();
