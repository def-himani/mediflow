-- procs/create_user_proc.sql
-- Example stored procedure to create a user. Uses DELIMITER blocks and therefore
-- should be applied via the mysql CLI or a connector that supports multi-statement execution.
DELIMITER //
CREATE PROCEDURE create_user(IN p_email VARCHAR(255), IN p_password_hash VARCHAR(255))
BEGIN
  INSERT INTO users (email, password_hash) VALUES (p_email, p_password_hash);
END
//
DELIMITER ;
