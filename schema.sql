DROP TABLE IF EXISTS books;
CREATE TABLE books (
    ISBN CHAR(13) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    publisher VARCHAR(100),
    publish_year INT CHECK(publish_year BETWEEN 0 AND EXTRACT('year' FROM CURRENT_DATE)),
    publish_month INT CHECK(publish_month BETWEEN 1 AND 12),
    price NUMERIC(6,2)
);

DROP TABLE IF EXISTS miners;
CREATE TABLE miners (
    ID VARCHAR(10) PRIMARY KEY,
    password VARCHAR(200) NOT NULL, -- Using MD5 encryption, thus it's longer
    name VARCHAR(100) NOT NULL,
    mail VARCHAR(100) CHECK(mail LIKE '%@%.%'),
    phone CHAR(11),
    gender INT, -- 0 for male, 1 for female, 2 for non-binary
    age INT CHECK(age>0)
);
