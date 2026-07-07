import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

function getEnvVar(key: string): string | undefined {
  if (process.env[key]) {
    return process.env[key];
  }
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const lines = envFile.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match && match[1] === key) {
           return match[2].trim();
        }
      }
    }
  } catch (e) {
    console.error("Error reading .env:", e);
  }
  return undefined;
}

const testimonialTemplates = [
  "Wirabhakti luar biasa! Anak saya yang awalnya pemalu kini jauh lebih percaya diri setelah bergabung. Kedisiplinan yang diajarkan oleh para coach sangat terlihat di rumah.",
  "Sangat senang menyekolahkan anak di sini. Pelatih profesional dan fasilitas lapangan sangat aman untuk anak KU-12. Rapor perkembangan fisik dari akademi sangat detail.",
  "Terima kasih Coach Shin dan tim atas bimbingannya. Latihan fisiknya terarah, anak saya tidak hanya mahir dribbling tapi fisiknya juga makin bugar dan tidak gampang sakit.",
  "Program KU-10 sangat menyenangkan bagi anak-anak. Metode latihannya fun tapi tetap fokus pada teknik fundamental dasar basket. Recommended sekali!",
  "Disiplin, sportivitas, dan kerja sama tim sangat ditanamkan di sini. Anak saya selalu tidak sabar menunggu hari Sabtu untuk datang latihan.",
  "Wirabhakti bukan sekadar akademi basket biasa, tapi juga wadah pembentukan karakter. Anak saya diajari menghormati kawan dan lawan sejak bergabung di KU-10.",
  "Fasilitas penunjang di Wirabhakti sangat memadai. Lapangannya terawat dan pelatihnya bersertifikat profesional sehingga orang tua merasa tenang melepas anak berlatih.",
  "Perkembangan anak saya sangat signifikan setelah 6 bulan di KU-14. Dribble, shooting, dan kerja samanya meningkat pesat. Terima kasih Coach Indra!",
  "Sistem penilaian atau rapor evaluasi bulanan di Wirabhakti sangat transparan. Kami sebagai orang tua tahu persis aspek fisik apa saja yang perlu ditingkatkan anak.",
  "Akademi basket terbaik di Lumajang! Pembinaannya berjenjang dari pemula hingga mahir, memberikan panggung yang sehat bagi anak untuk berkompetisi.",
  "Anak saya bergabung di KU-12 dan sangat menikmati atmosfer latihannya. Para coach sangat telaten dalam membimbing anak-anak pemula.",
  "Sangat bersyukur ada Wirabhakti Basketball Academy. Pelatihan fisiknya disiplin namun tetap memperhatikan porsi pertumbuhan fisik anak usia dini.",
  "Latihan kerja sama tim yang luar biasa. Anak saya jadi mengerti pentingnya kolaborasi dan saling support antar rekan satu tim, tidak cuma ingin menonjol sendiri.",
  "Coach Bima sangat komunikatif dengan orang tua. Kami selalu mendapat update berkala mengenai sikap dan performa anak saat latihan.",
  "Sejak masuk KU-14, anak saya tidak hanya pintar main basket tapi pola hidupnya jadi lebih sehat. Tidur teratur dan makannya jadi banyak demi fisik yang kuat.",
  "Terima kasih Wirabhakti! Anak saya berhasil lolos seleksi tim sekolah berkat bekal latihan fundamental yang kuat selama 1 tahun di akademi ini.",
  "Program latihan pertahanannya sangat disiplin. Anak saya jadi tahu bagaimana caranya bertahan dengan cerdas tanpa harus melakukan foul yang tidak perlu.",
  "Kurikulum pembinaan usia dini di sini teratur sekali. Anak saya berkembang setahap demi setahap, mulai dari body control hingga teknik menembak (shooting).",
  "Suasana latihan sangat positif dan suportif. Sesama atlet saling menyemangati, membuat anak saya betah dan selalu termotivasi memberikan yang terbaik.",
  "Wirabhakti sangat fokus pada pembinaan usia muda. Sebagai orang tua, saya sangat puas dengan progress kedisiplinan dan sopan santun anak saya di rumah.",
  "Pelatih di KU-10 sangat sabar dan ceria. Sangat ramah untuk anak-anak kecil yang baru pertama kali menyentuh bola basket.",
  "Sistem manajemen akademi sangat profesional. Pendaftaran, tagihan bulanan, dan jadwal kompetisi semuanya terkelola dengan rapi di portal dashboard.",
  "Kemampuan shooting anak saya berkembang pesat sejak di KU-17. Koreksi detail dari para pelatih sangat membantu mengoreksi tekniknya yang salah.",
  "Latihan kelincahan dan kecepatan (footwork) di sini patut diacungi jempol. Anak saya jadi lebih lincah dan refleknya meningkat tajam saat bertanding.",
  "Sangat merekomendasikan Wirabhakti bagi orang tua yang ingin menyalurkan minat olahraga anaknya. Lingkungannya bersih, aman, dan sangat profesional.",
  "Kedisiplinan di lapangan terbawa ke kehidupan sehari-hari anak saya. Belajar jadi lebih teratur dan mandiri semenjak aktif di akademi.",
  "Rapor performa bulanan sangat membantu kami memantau bakat anak. Hasil statistiknya detail sekali, dari poin dribbling hingga konsistensi latihan.",
  "Terima kasih Coach Nova atas evaluasinya yang tajam namun membangun. Anak saya termotivasi untuk terus memperbaiki kesalahannya.",
  "Atmosfer kekeluargaan di Wirabhakti sangat terasa. Para orang tua juga saling mendukung dan bersosialisasi dengan baik selama menemani anak berlatih.",
  "Investasi terbaik untuk masa depan anak. Wirabhakti terbukti mampu menyalurkan bakat olahraga anak ke arah yang berprestasi dan berkarakter unggul."
];

async function seedTestimonials() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error("DATABASE_URL not found. Please specify DATABASE_URL environment variable.");
    return;
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // 1. Fetch parents
    const query = `
      SELECT p.id as "parentId", u."fullName" 
      FROM "parent" p 
      JOIN "user" u ON p."userId" = u.id 
      LIMIT 30
    `;
    const parentsRes = await client.query(query);
    const parents = parentsRes.rows;

    if (parents.length === 0) {
      console.log("No parents found in the database. Please seed users first.");
      return;
    }

    console.log(`Found ${parents.length} parents. Seeding testimonials...`);

    // Ensure the testimonials table exists (TypeORM might not have initialized it if app hasn't restarted)
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name   = 'testimonials'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log("Creating 'testimonials' table in database...");
      await client.query(`
        CREATE TABLE "testimonials" (
          "id" uuid NOT NULL DEFAULT gen_random_uuid(),
          "content" text NOT NULL,
          "rating" integer NOT NULL DEFAULT 5,
          "status" character varying NOT NULL DEFAULT 'pending',
          "parentId" uuid NOT NULL,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "PK_testimonials_id" PRIMARY KEY ("id"),
          CONSTRAINT "REL_testimonials_parentId" UNIQUE ("parentId"),
          CONSTRAINT "FK_testimonials_parentId" FOREIGN KEY ("parentId") REFERENCES "parent"("id") ON DELETE CASCADE
        );
      `);
    }

    let seedCount = 0;
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const content = testimonialTemplates[i % testimonialTemplates.length];
      const rating = i % 8 === 0 ? 4 : 5; // Mostly 5 stars, some 4 stars
      const status = 'approved'; // Seeded testimonials are pre-approved
      const id = randomUUID();

      // Check if testimonial already exists for this parent
      const checkExist = await client.query('SELECT id FROM "testimonials" WHERE "parentId" = $1', [parent.parentId]);
      
      if (checkExist.rows.length > 0) {
        // Update content
        await client.query(
          'UPDATE "testimonials" SET "content" = $1, "rating" = $2, "status" = $3, "updatedAt" = NOW() WHERE "parentId" = $4',
          [content, rating, status, parent.parentId]
        );
        console.log(`[UPDATE] Testimonial for parent '${parent.fullName}'`);
      } else {
        // Insert new testimonial
        await client.query(
          'INSERT INTO "testimonials" ("id", "content", "rating", "status", "parentId") VALUES ($1, $2, $3, $4, $5)',
          [id, content, rating, status, parent.parentId]
        );
        console.log(`[INSERT] Testimonial for parent '${parent.fullName}'`);
        seedCount++;
      }
    }

    console.log(`\nTestimonial Seeding Complete. Successfully seeded: ${seedCount} testimonials.`);

  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

seedTestimonials();
