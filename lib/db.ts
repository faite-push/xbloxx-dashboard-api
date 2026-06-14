import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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

// Singleton pattern to avoid issues with Hot Reload
let dbInstance: Database | null = null;
let dbPath: string;

function getDbPath(): string {
  return path.join(/* @ts-ignore */ process.cwd(), 'data', 'database.json');
}

function initializeDatabase(): Database {
  const dataDir = path.join(/* @ts-ignore */ process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbPath = getDbPath();

  if (!fs.existsSync(dbPath)) {
    // Create default database with admin
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

function getDb(): Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

function saveDb(db: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  dbInstance = db;
}

// Admin operations
export function getAdminByEmail(email: string): Admin | undefined {
  const db = getDb();
  return db.admins.find((admin) => admin.email === email);
}

export function getAdminById(id: number): Admin | undefined {
  const db = getDb();
  return db.admins.find((admin) => admin.id === id);
}

// Influencer operations
export function getAllInfluencers(): Influencer[] {
  const db = getDb();
  return db.influencers.sort((a, b) => a.display_order - b.display_order);
}

export function getInfluencerById(id: number): Influencer | undefined {
  const db = getDb();
  return db.influencers.find((inf) => inf.id === id);
}

export function createInfluencer(data: Omit<Influencer, 'id' | 'created_at' | 'updated_at'>): Influencer {
  const db = getDb();
  const newId = db.influencers.length > 0 ? Math.max(...db.influencers.map((i) => i.id)) + 1 : 1;
  const newInfluencer: Influencer = {
    ...data,
    id: newId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.influencers.push(newInfluencer);
  saveDb(db);
  return newInfluencer;
}

export function updateInfluencer(id: number, data: Partial<Omit<Influencer, 'id' | 'created_at'>>): Influencer | null {
  const db = getDb();
  const index = db.influencers.findIndex((inf) => inf.id === id);
  if (index === -1) return null;
  
  db.influencers[index] = {
    ...db.influencers[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveDb(db);
  return db.influencers[index];
}

export function deleteInfluencer(id: number): boolean {
  const db = getDb();
  const index = db.influencers.findIndex((inf) => inf.id === id);
  if (index === -1) return false;
  
  db.influencers.splice(index, 1);
  saveDb(db);
  return true;
}

export function reorderInfluencers(ids: number[]): void {
  const db = getDb();
  const influencerMap = new Map(db.influencers.map((inf) => [inf.id, inf]));
  
  ids.forEach((id, index) => {
    const influencer = influencerMap.get(id);
    if (influencer) {
      influencer.display_order = index + 1;
    }
  });
  
  saveDb(db);
}

export default getDb;
