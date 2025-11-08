-- queries/two_selects.sql
-- Example file with two SELECTs (not recommended for frontend; included as demo only)
-- result: users
SELECT id, email FROM users LIMIT 5;

-- result: counts
SELECT COUNT(*) AS user_count FROM users;
