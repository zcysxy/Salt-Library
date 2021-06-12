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
GRANT ALL
ON cart
TO miner;

GRANT UPDATE
ON miners, tag
TO miner;

GRANT SELECT
ON marks, buy, tag, request, requested_books, mark_book_view, buy_view
TO miner;

GRANT USAGE, SELECT
ON SEQUENCE marks_mark_id_seq
TO miner;

GRANT INSERT
ON marks, buy, requested_books, request, tag, rate, review
TO miner;

GRANT DELETE
ON tag, rate, review
TO miner;

GRANT UPDATE (u_rating, u_num, sold)
ON books
TO miner;