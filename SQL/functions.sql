
/**
 * 8 CHECK functions
 * 1. change_tag
 * 2. change_rating 
 * 3. change_review
 *      These three functions change the target after
 *      checking the constraint, or return the error message
 * 4. insert_miners
 * 5. update_miners
 *      These two functions insert/change the Miner info after
 *      checking the validation, or return the error message
 * 6. check_book
 *      Check the validation of a book's info, and return the error message
 * 7. insert_request
 *      Insert a book request after checking the constraint,
 *      or return the error message
 * 8. read_time
 *      Calculate the time for a Miner to finish the book
 */

/**
 * Function to change the tag,
 * and check if the miner has bought the book
 * before they tag it reading or read
 */
CREATE OR REPLACE FUNCTION change_tag(
    isbn_in CHAR(13),
    id_in VARCHAR,
    tag_state_in INT
)
/* Return the error message */
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
        FROM buy_view
        WHERE id=id_in AND isbn=isbn_in
    ) THEN
        msg = ('You have to buy this book first before you tag it ' || state_txt);

    /* Otherwise call the SQL procedure tagging to tag */
    ELSE
        CALL tagging(isbn_in, id_in, tag_state_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to change the rating,
 * and check if the miner has read the book
 */
CREATE OR REPLACE FUNCTION change_rating(
    isbn_in CHAR(13),
    id_in VARCHAR,
    rating_in INT
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* check before the miner rate the book */
    IF NOT EXISTS (
        SELECT *
        FROM tag_view
        WHERE id=id_in AND isbn=isbn_in AND tag_state=3
    ) THEN
        msg = 'You have to finish this book first before you rate it!';

    /* Otherwise call the SQL procedure rating to rate */
    ELSE
        CALL rating(isbn_in, id_in, rating_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to change the review,
 * and check if the miner has read the book
 */
CREATE OR REPLACE FUNCTION change_review(
    isbn_in CHAR(13),
    id_in VARCHAR,
    content_in VARCHAR
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* check before the miner rate the book */
    IF NOT EXISTS (
        SELECT *
        FROM tag_view
        WHERE id=id_in AND isbn=isbn_in AND tag_state=3
    ) THEN
        msg = 'You have to finish this book first before you review it!';

    /* Otherwise call the SQL procedure reviewing to review */
    ELSE
        CALL reviewing(isbn_in, id_in, content_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to check the validation of the sign up information,
 * and insert it into table miners if it is valid
 */
CREATE OR REPLACE FUNCTION insert_miners(
    id_in VARCHAR,
    pw_in VARCHAR,
    name_in VARCHAR,
    mail_in VARCHAR,
    phone_in VARCHAR,
    gender_in INT, /* gender and age are always valid thanks to HTML form constraints */
    age_in INT
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* ID */
    /* PRIMARY KEY */
    IF id_in IS NULL THEN
        msg = 'ID must not be empty!';
    ELSIF id_in IN (SELECT id FROM miners) THEN
        msg = 'The input ID already exists!';
    /* CHECK pattern */
    ELSIF id_in NOT SIMILAR TO '[a-zA-Z0-9_]{1,10}' THEN
        msg = 'The input ID doesn''t match the valid pattern!';

    /* password */
    /* notice that we don't enforce the same constraint to the table,
       so this is the only chance we check the validation of the password */
    ELSIF pw_in NOT SIMILAR TO '[a-zA-Z0-9_]{4,16}' THEN
        msg = 'The input password doesn''t match the valid pattern!';

    /* name */
    /* NOT NULL */
    ELSIF name_in IS NULL THEN
        msg = 'Name must not be empty!';
    /* VARCHAR(100) */
    ELSIF CHAR_LENGTH(name_in) > 100 THEN
        msg = 'The input name is too long!';

    /* mail */
    /* CHECK pattern */
    /* Here we assume that the input mail won't be too long (>100) */
    ELSIF (mail_in IS NOT NULL) AND (mail_in NOT LIKE '%@%.%') THEN
        msg = 'The input email adress is not valid!';

    /* phone */
    /* CHECK pattern */
    ELSIF (phone_in IS NOT NULL) AND (phone_in NOT SIMILAR TO '[0-9]{11}') THEN
        msg = 'The input mobile phone number is not valid!';
    ELSE
        INSERT INTO miners(ID, password, name, mail, phone, gender, age) VALUES
            (id_in, MD5(pw_in), name_in, mail_in, phone_in, gender_in, age_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to check the validation of the profile update information,
 * and update it valid
 */
CREATE OR REPLACE FUNCTION update_miners(
    id_in VARCHAR,
    old_pw_in VARCHAR,
    new_pw_in VARCHAR,
    name_in VARCHAR,
    mail_in VARCHAR,
    phone_in VARCHAR,
    gender_in INT,
    age_in INT
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* password */
    IF new_pw_in IS NOT NULL AND old_pw_in IS NULL THEN
        msg = 'The old password is needed!';
    ELSIF ((new_pw_in IS NOT NULL) AND (MD5(old_pw_in) <> (SELECT password FROM miners WHERE id=id_in))) THEN
        msg = 'The old password is not correct!';
    ELSIF (new_pw_in IS NOT NULL) AND (new_pw_in NOT SIMILAR TO '[a-zA-Z0-9_]{4,16}') THEN
        msg = 'The new password doesn''t match the valid pattern!';
    /* name */
    ELSIF CHAR_LENGTH(name_in) > 100 THEN
        msg = 'The input name is too long!';
    /* mail */
    ELSIF (mail_in IS NOT NULL) AND (mail_in NOT LIKE '%@%.%') THEN
        msg = 'The input email adress is not valid!';
    /* phone */
    ELSIF (phone_in IS NOT NULL) AND (phone_in NOT SIMILAR TO '[0-9]{11}') THEN
        msg = 'The input mobile phone number is not valid!';
    ELSE
        UPDATE miners
        SET
            /* COALESCE returns the first argument that is not null */
            password = COALESCE(MD5(new_pw_in), password),
            name = COALESCE(name_in, name),
            mail = mail_in,
            phone = phone_in,
            gender = gender_in,
            age = age_in
        WHERE id = id_in;
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to check the validation of book info.
 * We assume that the title, author, publisher are valid,
 * that is, they are not too long;
 * And due to HTML form constraint, price is valid
 */
CREATE OR REPLACE FUNCTION check_book(
    isbn_in VARCHAR,
    title_in VARCHAR,
    publish_year_in INT,
    publish_month_in INT,
    edit BOOLEAN DEFAULT FALSE
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* ISBN */
    IF (NOT edit) AND (isbn_in IN (SELECT isbn FROM books)) THEN
        msg = 'This book already exists!';
    ELSIF isbn_in NOT SIMILAR TO '[0-9]{12}[0-9Xx]' THEN
        msg = 'The ISBN is not valid!';
    
    /* title */
    ELSIF title_in IS NULL THEN
        msg = 'Book title must not be empty!';

    ELSIF publish_month_in IS NOT NULL AND publish_year_in IS NULL THEN
        msg = 'Only publish month no publish year is not allowed!';
    ELSIF NOT((publish_year_in, publish_month_in) < (DATE_PART('year', CURRENT_DATE), DATE_PART('month', CURRENT_DATE))) THEN
        msg = 'The publish date cannot be the future!';
    ELSE
        msg = NULL;
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to requeset a book,
 * and check if the book is already existed or requested
 */
CREATE OR REPLACE FUNCTION insert_request(
    id_in VARCHAR,
    isbn_in CHAR(13),
    title_in VARCHAR,
    author_in VARCHAR,
    publisher_in VARCHAR,
    publish_year_in INT,
    publish_month_in INT,
    price_in NUMERIC
)
/* Return the error message */
RETURNS VARCHAR AS $msg$
DECLARE msg VARCHAR;
BEGIN
    /* Check before the miner request the book */
    /* First check the validation of the book info */
    msg = check_book(isbn_in, title_in, publish_year_in, publish_month_in);
    
    IF msg IS NOT NULL THEN
        msg = msg;
    ELSIF isbn_in IN (SELECT isbn FROM request) THEN
        msg = 'This book has already been requested! Please wait for the request result :)';
    ELSE
        INSERT INTO request VALUES (isbn_in, id_in, CURRENT_TIMESTAMP, 1);
        INSERT INTO requested_books VALUES (isbn_in, title_in, author_in, publisher_in, publish_year_in, publish_month_in, price_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/**
 * Function to calculate the time spent by someone to finish a book,
 * which is the time span between they tag it reading and read,
 * or the time span between they bought it and tag it read
 */
CREATE OR REPLACE FUNCTION read_time(
    id_in VARCHAR,
    mark_id_in INT
)
/* Return the message */
RETURNS INT AS $ts$
DECLARE ts INT;
DECLARE isbn_temp CHAR(13);
DECLARE date_end DATE;
DECLARE date_start DATE;
BEGIN
    /* Get the ISBN of the book  */
    SELECT isbn, DATE(mark_time) INTO isbn_temp, date_end
    FROM marks
    WHERE mark_id = mark_id_in;

    /* Check if the Miner tagged it reading */
    SELECT DATE(mark_time) INTO date_start
    FROM (
        SELECT * 
        FROM marks 
        WHERE id=id_in AND isbn=isbn_temp AND operation=2
    ) AS r1 NATURAL JOIN (
        SELECT *
        FROM tag
        WHERE tag_state=2
    ) AS r2
    ORDER BY mark_time
    LIMIT 1;

    /* Otherwise, we take the date they bought the books as the start date*/
    IF date_start IS NULL THEN
        SELECT DATE(mark_time) INTO date_start
        FROM marks
        WHERE id=id_in AND isbn=isbn_temp AND operation=1;
    END IF;
    ts = 1 + DATE_PART('DAY', date_end::TIMESTAMP - date_start::TIMESTAMP);
    RETURN ts;
END;
$ts$ LANGUAGE plpgsql;