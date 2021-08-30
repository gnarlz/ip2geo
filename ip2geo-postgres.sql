CREATE SCHEMA KEY;

CREATE TABLE key.request (
key character varying NOT NULL,
total bigint NOT NULL,
created_at timestamp default now() NOT NULL,
updated_at timestamp default now() NOT NULL
);
ALTER TABLE ONLY key.request ADD CONSTRAINT "PK_request" PRIMARY KEY (key);


-- LIMIT IS A SLOWLY CHANGING DIMENSION
-- THIS TABLE ALLOWS MULTIPLE ROWS FOR A KEY - ALLOWS US TO MAINTAIN HISTORY
CREATE TABLE key.limit (
key character varying NOT NULL,
limit_ bigint NOT NULL,
ratelimit_max bigint,
ratelimit_duration bigint,
created_at timestamp default now() NOT NULL,
updated_at timestamp default now() NOT NULL
);

-- AUTHORIZATION IS A SLOWLY CHANGING DIMENSION
-- THIS TABLE ALLOWS MULTIPLE ROWS FOR A KEY - ALLOWS US TO MAINTAIN HISTORY
CREATE TABLE key.authorization (
key character varying NOT NULL,
authorized bool default true,
message character varying,
ratelimit_max bigint,
ratelimit_duration bigint,
created_at timestamp default now() NOT NULL,
updated_at timestamp default now() NOT NULL
);

-- ACCOUNT IS A SLOWLY CHANGING DIMENSION
-- THIS TABLE ALLOWS MULTIPLE ROWS FOR A KEY - ALLOWS US TO MAINTAIN HISTORY
CREATE TABLE key.account (
key character varying NOT NULL,
subscription_id character varying NOT NULL,
plan_id character varying NOT NULL,
email character varying NOT NULL,
fname character varying,
lname character varying,
company character varying,
active bool NOT NULL,
created_at timestamp default now() NOT NULL,
updated_at timestamp default now() NOT NULL
);


CREATE SCHEMA log;

CREATE TABLE log.lookup (
request_id uuid PRIMARY KEY,
request_ts timestamp NOT NULL,
key uuid,
lookup_ip inet,
source_ip inet,
is_desktop boolean,
is_mobile boolean,
is_smart_tv boolean,
is_tablet boolean,
viewer_country character varying,
accept_language character varying,
host character varying,
path character varying,
origin character varying,
referer character varying,
user_agent character varying,
status character varying,
status_code smallint,
time_elapsed smallint,
latitude float,
longitude float,
city_name character varying,
subdivision_1_name character varying,
subdivision_1_iso_code character varying,
postal_code character varying,
country_name character varying,
country_iso_code character varying,
continent_name character varying,
continent_code character varying,
time_zone character varying,
time_zone_abbr character varying,
time_zone_offset smallint,
time_zone_is_dst boolean,
time_zone_current_time character varying,
is_anonymous_proxy boolean,
is_satellite_provider boolean,
asn character varying,
organization character varying,
error_message character varying
);
CREATE INDEX idx_lookup_request_ts ON log.lookup(request_ts);
CREATE INDEX idx_lookup_key ON log.lookup(key);


