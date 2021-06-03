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

/* Function to check the validation of the sign up information,
   and insert it into table miners if it is valid */
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
    IF id_in IS NULL THEN
        msg = 'ID must not be empty!';
    ELSIF id_in IN (SELECT id FROM miners) THEN
        msg = 'The input ID already exists!';
    ELSIF id_in NOT SIMILAR TO '[a-zA-Z0-9_]{1,10}' THEN
        msg = 'The input ID doesn''t match the valid pattern!';
    /* password */
    /* notice that we don't enforce the same constraint to the table,
       so this is the only chance we check the validation of the password */
    ELSIF pw_in NOT SIMILAR TO '[a-zA-Z0-9_]{4,16}' THEN
        msg = 'The input password doesn''t match the valid pattern!';
    /* name */
    ELSIF name_in IS NULL THEN
        msg = 'Name must not be empty!';

    ELSIF CHAR_LENGTH(name_in) > 100 THEN
        msg = 'The input name is too long!';
    /* mail */
    ELSIF (mail_in IS NOT NULL) AND (mail_in NOT LIKE '%@%.%') THEN
        msg = 'The input email adress is not valid!';
    /* phone */
    ELSIF (phone_in IS NOT NULL) AND (phone_in NOT SIMILAR TO '[0-9]{11}') THEN
        msg = 'The input mobile phone number is not valid!';
    ELSE
        INSERT INTO miners VALUES (id_in, MD5(pw_in), name_in, mail_in, phone_in, gender_in, age_in);
        msg = '';
    END IF;
    RETURN msg;
END;
$msg$ LANGUAGE plpgsql;

/* Function to check the validation of the profile update information,
   and update it valid */
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
    ELSIF (new_pw_in IS NOT NULL) AND (new_pw_in NOT SIMILAR TO '[a-zA-Z0-9_]{1,16}') THEN
        msg = 'The new password doesn''t match the valid pattern!';
    /* name */
    ELSIF (name_in IS NOT NULL) AND (name_in NOT SIMILAR TO '[a-zA-Z0-9_]{1,10}') THEN
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