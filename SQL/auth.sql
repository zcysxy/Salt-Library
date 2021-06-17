/* Create Roles */
CREATE ROLE miner LOGIN PASSWORD 'miner';
CREATE USER tourist WITH PASSWORD '1234';

/* Authorization */
/* Tourist/public privileges */
GRANT SELECT
ON books, miners, marks, tag, rate, review, tag_view, rate_view, review_view
TO public;

GRANT INSERT
ON miners
TO public;

/* Miner privileges */
GRANT SELECT, UPDATE, INSERT, DELETE
ON cart
TO miner;

GRANT UPDATE
ON miners
TO miner;

GRANT INSERT
ON marks
TO miner;

GRANT SELECT, INSERT
ON buy
TO miner;

GRANT INSERT, DELETE
ON tag, review, rate
TO miner;

GRANT USAGE, SELECT
ON SEQUENCE marks_mark_id_seq
TO miner;

GRANT UPDATE (u_rating, u_num, sold)
ON books
TO miner;

GRANT SELECT, INSERT
ON request, requested_books
TO miner;

GRANT SELECT
ON mark_book_view, buy_view
TO miner;