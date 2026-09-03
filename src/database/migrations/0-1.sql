CREATE TABLE versions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('release', 'snapshot', 'old_beta', 'old_alpha')),
  time INTEGER NOT NULL,
  releaseTime INTEGER NOT NULL,
  client TEXT NOT NULL,
  server TEXT
);
