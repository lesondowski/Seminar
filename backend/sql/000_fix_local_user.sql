USE mysql;

-- Create app user for both localhost and 127.0.0.1 to avoid host mismatch errors.
CREATE USER IF NOT EXISTS 'gps_user'@'localhost' IDENTIFIED BY 'gps_password';
CREATE USER IF NOT EXISTS 'gps_user'@'127.0.0.1' IDENTIFIED BY 'gps_password';

ALTER USER 'gps_user'@'localhost' IDENTIFIED BY 'gps_password';
ALTER USER 'gps_user'@'127.0.0.1' IDENTIFIED BY 'gps_password';

GRANT ALL PRIVILEGES ON gps_visitor_app.* TO 'gps_user'@'localhost';
GRANT ALL PRIVILEGES ON gps_visitor_app.* TO 'gps_user'@'127.0.0.1';

FLUSH PRIVILEGES;
