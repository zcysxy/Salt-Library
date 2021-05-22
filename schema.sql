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

DROP TABLE IF EXISTS borrower;
CREATE TABLE borrower (
    ID CHAR(11) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credit INT DEFAULT 5
);
