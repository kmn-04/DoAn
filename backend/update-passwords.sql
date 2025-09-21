-- Update password hashes directly
UPDATE users SET password = '$2a$10$eImiTXuWVxfM37uY4JANjOhXAh2Rdd3mVu/TzTKvd1HS7laxdqWDO' WHERE email = 'admin@gmail.com';
UPDATE users SET password = '$2a$10$dXJ3sw6G7P1LVUmDLxBdBeMohpOFc.2caTfwQqP/RXSBNKAjbLDrC' WHERE email = 'staff@gmail.com';
UPDATE users SET password = '$2a$10$GRLdGijbbqRWX8iyiO5OKu7csNa7vQDdmVfqzxBLYX5/XdnWer2u.' WHERE email = 'test@test.com';
