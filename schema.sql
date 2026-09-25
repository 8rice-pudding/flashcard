CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  translation TEXT DEFAULT '',
  english TEXT DEFAULT '',
  chinese TEXT DEFAULT '',
  meaning TEXT DEFAULT '',
  sentence TEXT DEFAULT '',
  sentence_cn TEXT DEFAULT '',
  image_data_url TEXT DEFAULT '',
  pronunciation TEXT DEFAULT '',
  type TEXT DEFAULT 'word',
  box INTEGER NOT NULL DEFAULT 1,
  next_review_date TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_words_next_review_date
  ON words(next_review_date);
