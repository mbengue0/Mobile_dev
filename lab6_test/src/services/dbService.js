import * as SQLite from 'expo-sqlite';

let db = null;

// Initialize database
export const initDb = async () => {
  try {
    db = await SQLite.openDatabaseAsync('notes_app.db');
    await createTables();
    console.log('✅ Database initialized');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Create tables
const createTables = async () => {
  try {
    // Categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#007AFF',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        category_id INTEGER DEFAULT 1,
        is_pinned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // Tags table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    // Insert default category
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)',
      ['General', '#007AFF']
    );
    
    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Helper function to ensure DB is ready
const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
};

// CATEGORIES CRUD
export const CategoryService = {
  async addCategory(name, color = '#007AFF') {
    const database = getDb();
    try {
      const result = await database.runAsync(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        [name, color]
      );
      return { id: result.lastInsertRowId, name, color };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async getCategories() {
    const database = getDb();
    try {
      return await database.getAllAsync('SELECT * FROM categories ORDER BY name');
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }
};

// NOTES CRUD
export const NoteService = {
  async addNote(title, content, categoryId = 1) {
    const database = getDb();
    try {
      const result = await database.runAsync(
        'INSERT INTO notes (title, content, category_id) VALUES (?, ?, ?)',
        [title, content, categoryId]
      );
      return { id: result.lastInsertRowId, title, content, category_id: categoryId };
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  async getNotes() {
    const database = getDb();
    try {
      return await database.getAllAsync(`
        SELECT 
          notes.*,
          categories.name as category_name,
          categories.color as category_color
        FROM notes
        LEFT JOIN categories ON notes.category_id = categories.id
        ORDER BY notes.updated_at DESC
      `);
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async getNote(id) {
    const database = getDb();
    try {
      return await database.getFirstAsync(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  async updateNote(id, title, content, categoryId) {
    const database = getDb();
    try {
      const result = await database.runAsync(
        'UPDATE notes SET title = ?, content = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, categoryId, id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  async deleteNote(id) {
    const database = getDb();
    try {
      const result = await database.runAsync('DELETE FROM notes WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

// TAGS CRUD
export const TagService = {
  async addTag(name) {
    const database = getDb();
    try {
      const result = await database.runAsync(
        'INSERT OR IGNORE INTO tags (name) VALUES (?)',
        [name]
      );
      return { id: result.lastInsertRowId, name };
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  },

  async getTags() {
    const database = getDb();
    try {
      return await database.getAllAsync('SELECT * FROM tags ORDER BY name');
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }
};