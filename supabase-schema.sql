-- Supabase SQL Editor'da çalıştır
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_name TEXT NOT NULL,
  account_address TEXT NOT NULL,
  author_address TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'Public' CHECK (visibility IN ('Public', 'Unlisted', 'Private')),
  file_name TEXT,
  file_size TEXT,
  lines INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  tips INTEGER DEFAULT 0,
  reads INTEGER DEFAULT 0
);

CREATE INDEX posts_author_address_idx ON posts(author_address);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_visibility_idx ON posts(visibility);
