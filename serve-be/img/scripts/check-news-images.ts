import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  status: string;
};

function getEnvVar(key: string): string | undefined {
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
  } catch (error) {
    console.error('Error reading .env:', error);
  }

  return process.env[key];
}

function resolveUploadRoot(): string {
  const uploadDir = getEnvVar('UPLOAD_DIR');
  if (!uploadDir) {
    return path.resolve(__dirname, '../img');
  }

  return path.isAbsolute(uploadDir)
    ? uploadDir
    : path.resolve(__dirname, '..', uploadDir);
}

function resolveImagePath(uploadRoot: string, imagePath: string): string {
  const normalized = imagePath.replace(/^\/img\/?/, '');
  return path.join(uploadRoot, normalized);
}

async function checkNewsImages() {
  const dbUrl = getEnvVar('DATABASE_URL');
  if (!dbUrl) {
    console.error('DATABASE_URL not found');
    process.exitCode = 1;
    return;
  }

  const publishedOnly = process.argv.includes('--published-only');
  const uploadRoot = resolveUploadRoot();
  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();

    const whereClause = publishedOnly ? `WHERE status = 'published'` : '';
    const res = await client.query<NewsRow>(
      `SELECT id, slug, title, image, status FROM news ${whereClause} ORDER BY "createdAt" DESC`,
    );

    const rowsWithImages = res.rows.filter(
      (row) => row.image && row.image.startsWith('/img/'),
    );

    const missing = rowsWithImages
      .map((row) => {
        const filePath = resolveImagePath(uploadRoot, row.image!);
        return {
          ...row,
          filePath,
          exists: fs.existsSync(filePath),
        };
      })
      .filter((row) => !row.exists);

    console.log(
      JSON.stringify(
        {
          uploadRoot,
          checked: rowsWithImages.length,
          missing: missing.length,
          items: missing.map(({ id, slug, title, status, image, filePath }) => ({
            id,
            slug,
            title,
            status,
            image,
            filePath,
          })),
        },
        null,
        2,
      ),
    );

    if (missing.length > 0) {
      process.exitCode = 2;
    }
  } catch (error) {
    console.error('Error checking news images:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void checkNewsImages();
