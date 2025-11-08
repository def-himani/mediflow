-- Example seed data for mediflow (idempotent inserts)

INSERT INTO users (name, email)
VALUES ('Alice','alice@example.com')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO users (name, email)
VALUES ('Bob','bob@example.com')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Add more seed rows as needed
