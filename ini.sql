/* Create a new super user for the project */
CREATE USER curator WITH PASSWORD 'SaltLibrary' SUPERUSER;
CREATE USER tourist WITH PASSWORD '1234';

/* Create the project database */
CREATE DATABASE SaltLibrary;