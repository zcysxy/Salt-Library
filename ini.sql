/* Create a new super user for the project */
CREATE USER curator WITH PASSWORD 'SaltLibrary' CREATEDB CREATEROLE;

/* Create the project database */
CREATE DATABASE SaltLibrary;