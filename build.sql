CREATE TABLE `customer` (
  `id` int UNSIGNED NOT NULL COMMENT 'Customer unique ID',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Customer email address',
  `password` binary(60) NOT NULL COMMENT 'Customer password hash',
  `first_name` varchar(30) NOT NULL COMMENT 'Customer first name',
  `last_name` varchar(30) NOT NULL COMMENT 'Customer last name',
  `dob` date NOT NULL COMMENT 'Customer date of birth',
  `address` text NOT NULL COMMENT 'Customer address',
  `totp_secret` varchar(128) DEFAULT NULL COMMENT 'TOTP secret',
  `registered_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation date',
  `last_login` datetime DEFAULT NULL COMMENT 'Previous login date'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customers';

ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_email` (`email`);

ALTER TABLE `customer`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Customer unique ID', AUTO_INCREMENT=2;
COMMIT;