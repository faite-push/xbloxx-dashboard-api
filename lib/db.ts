import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

interface Admin {
  id: number;
  email: string;
  password: string;
  created_at: string;
}

interface Influencer {
  id: number;
  name: string;
  followers_count: string;
  image_url?: string;
  social_link?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface Database {
  admins: Admin[];
  influencers: Influencer[];
}

const IS_PROD = process.env.NODE_ENV === 'production';
const REDIS_URL = process.env.REDIS_URL;
const REDIS_KEY = 'xbloxx_db_v2';

// Standard Redis client for production
let redis: Redis | null = null;
if (IS_PROD && REDIS_URL) {
  redis = new Redis(REDIS_URL);
}

// Singleton pattern to avoid issues with Hot Reload
let dbCache: Database | null = null;

function getDbPath(): string {
  return path.join(process.cwd(), 'data', 'database.json');
}

async function initializeDatabase(): Promise<Database> {
  // Check Redis first in production
  if (IS_PROD && redis) {
    try {
      const data = await redis.get(REDIS_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Redis error:', err);
    }
    
    // Default DB if nothing in Redis
    const hashedPassword = bcrypt.hashSync('senha123', 10);
    const defaultDb: Database = {
      admins: [
        {
          id: 1,
          email: 'admin@teste.com',
          password: hashedPassword,
          created_at: new Date().toISOString(),
        },
      ],
      influencers: [],
    };
    await redis.set(REDIS_KEY, JSON.stringify(defaultDb));
    return defaultDb;
  }

  // Local development
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = getDbPath();

  if (!fs.existsSync(dbPath)) {
    const hashedPassword = bcrypt.hashSync('senha123', 10);
    const defaultDb: Database = {
      admins: [
        {
          id: 1,
          email: 'admin@teste.com',
          password: hashedPassword,
          created_at: new Date().toISOString(),
        },
      ],
      influencers: [],
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }

  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

async function getDb(): Promise<Database> {
  if (!dbCache) {
    dbCache = await initializeDatabase();
  }
  return dbCache;
}

async function saveDb(db: Database): Promise<void> {
  if (IS_PROD && redis) {
    await redis.set(REDIS_KEY, JSON.stringify(db));
  } else {
    const dbPath = getDbPath();
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
  dbCache = db;
}

// Admin operations
export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const db = await getDb();
  return db.admins.find((admin) => admin.email === email);
}

export async function getAdminById(id: number): Promise<Admin | undefined> {
  const db = await getDb();
  return db.admins.find((admin) => admin.id === id);
}

// Influencer operations
export async function getAllInfluencers(): Promise<Influencer[]> {
  const db = await getDb();
  return db.influencers.sort((a, b) => a.display_order - b.display_order);
}

export async function getInfluencerById(id: number): Promise<Influencer | undefined> {
  const db = await getDb();
  return db.influencers.find((inf) => inf.id === id);
}

export async function createInfluencer(data: Omit<Influencer, 'id' | 'created_at' | 'updated_at'>): Promise<Influencer> {
  const db = await getDb();
  const newId = db.influencers.length > 0 ? Math.max(...db.influencers.map((i) => i.id)) + 1 : 1;
  const newInfluencer: Influencer = {
    ...data,
    id: newId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.influencers.push(newInfluencer);
  await saveDb(db);
  return newInfluencer;
}

export async function updateInfluencer(id: number, data: Partial<Omit<Influencer, 'id' | 'created_at'>>): Promise<Influencer | null> {
  const db = await getDb();
  const index = db.influencers.findIndex((inf) => inf.id === id);
  if (index === -1) return null;
  
  db.influencers[index] = {
    ...db.influencers[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  await saveDb(db);
  return db.influencers[index];
}

export async function deleteInfluencer(id: number): Promise<boolean> {
  const db = await getDb();
  const index = db.influencers.findIndex((inf) => inf.id === id);
  if (index === -1) return false;
  
  db.influencers.splice(index, 1);
  await saveDb(db);
  return true;
}

export async function reorderInfluencers(ids: number[]): Promise<void> {
  const db = await getDb();
  const influencerMap = new Map(db.influencers.map((inf) => [inf.id, inf]));
  
  ids.forEach((id, index) => {
    const influencer = influencerMap.get(id);
    if (influencer) {
      influencer.display_order = index + 1;
    }
  });
  
  await saveDb(db);
}

export { getDb };
