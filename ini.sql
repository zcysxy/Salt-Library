/* Create a new super user for the project */
CREATE USER curator WITH PASSWORD 'SaltLibrary' SUPERUSER;

/* Create the project database */
CREATE DATABASE SaltLibrary;