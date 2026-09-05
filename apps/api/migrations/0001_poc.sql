-- 疎通専用。セーブ・認証用のテーブルはS10で追加する。
CREATE TABLE poc_schema (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL CHECK (version = 1)
);
INSERT INTO poc_schema (id, version) VALUES (1, 1);
