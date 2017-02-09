drop table if exists edits;
drop table if exists urls;
drop table if exists tags;
drop table if exists tag;
drop table if exists tag_edit_list;
drop table if exists tag_edit_list_to_tag;

CREATE TABLE urls (
   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   url VARCHAR(1024)              NOT NULL DEFAULT '',
   name          VARCHAR(1024)    NOT NULL DEFAULT '',
   editing_notes VARCHAR(1024)    NOT NULL DEFAULT '', -- no default specified and we're hosed  with future column name changes :|
--   imdb_url      VARCHAR(1024)    NOT NULL, -- can't use their ratings I doubt :|
--   trailer_urls  VARCHAR(1024)    NOT NULL,
--   synopsis      VARCHAR(1024)    NOT NULL
   age_recommendation_after_edited INT NOT NULL DEFAULT 0,
   wholesome_uplifting_level INT   NOT NULL DEFAULT 0,
   good_movie_rating INT NOT NULL DEFAULT 0, -- our rating out of 10
   review VARCHAR(8192) NOT NULL DEFAULT '', -- our rating explanation, age recommendation explanation :)
   amazon_episode_number INTEGER NOT NULL DEFAULT 0,
   amazon_episode_name VARCHAR(1024) NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX url_episode_num ON urls(url(256), amazon_episode_number); -- for unique *and* lookups (256 to avoid some mysql index too long)

CREATE TABLE edits (
   id             INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   start          REAL NOT NULL,
   endy           REAL NOT NULL,
   category       VARCHAR(1024) NOT NULL, 
   subcategory    VARCHAR(1024) NOT NULL, 
   details        VARCHAR(1024) NOT NULL, 
   more_details   VARCHAR(1024) NOT NULL, 
   default_action VARCHAR(1024) NOT NULL, 
   url_id         INT NOT NULL, FOREIGN KEY(URL_ID) REFERENCES urls(id)
);

insert into urls (url, name, editing_notes, amazon_episode_number, amazon_episode_name, age_recommendation_after_edited, wholesome_uplifting_level, good_movie_rating, review) 
   values ("https://www.amazon.com/Avatar-Last-Airbender-Season-3/dp/B001J6GZXK", 'ALTA season 3', "this does not have real edits", 5, "Beach test", 10, 8, 4, "review");
insert into urls (url, name, editing_notes, amazon_episode_number, amazon_episode_name, age_recommendation_after_edited, wholesome_uplifting_level, good_movie_rating, review) 
   values ("https://www.netflix.com/watch/80016224", 'meet the mormons [test]', "not done yet", 0, "", 10, 8, 4, "review");

insert into edits (start, endy, category, subcategory, details, default_action, url_id, more_details) values
      (2.0, 7.0, "a category", "a subcat", "details", "skip", (select id from urls where url='https://www.amazon.com/Avatar-Last-Airbender-Season-3/dp/B001J6GZXK'), "");
insert into edits (start, endy, category, subcategory, details, default_action, url_id, more_details) values
      (10.0, 20.0, "a category", "a subcat", "details", "mute", (select id from urls where url='https://www.amazon.com/Avatar-Last-Airbender-Season-3/dp/B001J6GZXK'), "");

alter table urls ADD COLUMN details VARCHAR(1024) NOT NULL DEFAULT '';
alter table urls CHANGE editing_notes editing_status VARCHAR(1024);

--

alter table urls ADD COLUMN image_url VARCHAR(2014) NOT NULL DEFAULT '';
update urls set image_url = 'https://upload.wikimedia.org/wikipedia/en/b/ba/Airbender-CompleteBook3.jpg' where id = 1; -- test data :)
alter table urls ADD COLUMN is_amazon_prime INT NOT NULL DEFAULT 0; -- probably should be TINYINT(1) but crystal mysql adapter no support it [?]
alter table urls ADD COLUMN rental_cost DECIMAL NOT NULL DEFAULT 0.0; -- too scared to use floats
alter table urls ADD COLUMN purchase_cost DECIMAL NOT NULL DEFAULT 0.0;

alter table urls ADD COLUMN total_time REAL NOT NULL default 0.0;

alter table urls ADD COLUMN amazon_second_url VARCHAR(2014) NOT NULL DEFAULT '';
CREATE INDEX url_amazon_second_url_episode_idx  ON urls(amazon_second_url(256), amazon_episode_number); -- non unique on purpose XXX do queries use this?

create unique index url_title_episode ON urls(name(256), amazon_episode_number); -- try to avoid accidental dupes
ALTER TABLE urls RENAME INDEX url_title_episode TO unique_name_with_episode; -- rename an index

ALTER TABLE urls CHANGE amazon_episode_name episode_name VARCHAR(1024);
ALTER TABLE urls CHANGE amazon_episode_number episode_number INTEGER;

alter table urls add column amazon_prime_free_type VARCHAR(2014) NOT NULL DEFAULT '';;
update urls set amazon_prime_free_type = 'Prime' where is_amazon_prime = 1;
alter table urls drop column is_amazon_prime;

RENAME TABLE edits TO tags; 

CREATE TABLE tag_edit_list (
   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   url_id INT NOT NULL,
   description          VARCHAR(1024)    NOT NULL DEFAULT '',
   notes VARCHAR(1024)    NOT NULL DEFAULT '',
   age_recommendation_after_edited INT NOT NULL DEFAULT 0,
	  FOREIGN KEY(URL_ID) REFERENCES urls(id)
   -- "community" :)
);

ALTER TABLE urls drop column age_recommendation_after_edited;

CREATE TABLE tag_edit_list_to_tag (
   id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
   tag_edit_list_id INT NOT NULL, FOREIGN KEY(tag_edit_list_id) references tag_edit_list(id),
   tag_id INT NOT NULL, FOREIGN KEY (tag_id) references tags(id),
   action VARCHAR(1024) NOT NULL
);
-- TODO some indices for these two?

alter table tag_edit_list change notes status_notes VARCHAR(1024)    NOT NULL DEFAULT '';
--XXX rename all tables to singular... :)

alter table urls add column create_timestamp TIMESTAMP not null DEFAULT NOW();

ALTER TABLE `urls` CHANGE COLUMN `image_url` `image_local_filename` VARCHAR(2014) NOT NULL DEFAULT '';

alter table tags add column oval_percentage_coords VARCHAR(24)    NOT NULL DEFAULT '';
alter table tags drop column more_details;
-- done prod
alter table tags change oval_percentage_coords oval_percentage_coords  VARCHAR(100) NOT NULL DEFAULT '';
-- done dev

-- and output to screen to show success...
select * from urls;
select * from tags;
