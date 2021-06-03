/* Function to change the tag,
   and check if the miner has bought the book
   before they tag it reading or read */
CREATE OR REPLACE FUNCTION change_tag(
    isbn_in CHAR(13),
    id_in VARCHAR,
    tag_state_in INT
)
/* Return the warning message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
DECLARE state_txt VARCHAR;
BEGIN
    state_txt = (
        CASE
            WHEN tag_state_in = 2 THEN '"reading"!'
            WHEN tag_state_in = 3 THEN '"read"!'
        END
    );

    /* check before the miner tag the book reading or read */
    IF (tag_state_in=2 OR tag_state_in=3) AND NOT EXISTS (
        SELECT *
        FROM buy NATURAL JOIN marks
        WHERE id=id_in AND isbn=isbn_in
    ) THEN
        msg = ('You have to buy this book first before you tag it ' || state_txt);

    ELSE
        CALL tagging(isbn_in, id_in, tag_state_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/* Function to change the rating,
   and check if the miner has read the book */
CREATE OR REPLACE FUNCTION change_rating(
    isbn_in CHAR(13),
    id_in VARCHAR,
    rating_in INT
)
/* Return the warning message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* check before the miner rate the book */
    IF NOT EXISTS (
        SELECT *
        FROM tag NATURAL JOIN marks
        WHERE id=id_in AND isbn=isbn_in AND tag_state=3
    ) THEN
        msg = 'You have to finish this book first before you rate it!';

    ELSE
        CALL rating(isbn_in, id_in, rating_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/* Function to change the review,
   and check if the miner has read the book */
CREATE OR REPLACE FUNCTION change_review(
    isbn_in CHAR(13),
    id_in VARCHAR,
    content_in VARCHAR
)
/* Return the warning message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* check before the miner rate the book */
    IF NOT EXISTS (
        SELECT *
        FROM tag NATURAL JOIN marks
        WHERE id=id_in AND isbn=isbn_in AND tag_state=3
    ) THEN
        msg = 'You have to finish this book first before you review it!';

    ELSE
        CALL reviewing(isbn_in, id_in, content_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;