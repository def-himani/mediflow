-- mutations/update_user_status.sql
-- Update a user's active status by id
UPDATE users
SET is_active = :is_active
WHERE id = :user_id;
