Backend API
===========

General structure
-----------------

REST resources

Most resources support both GET & PUT

PUT will do upsert

langId query parameter is used to indicate specified language. Empty or no langId
indicates master.

Master content usually has a "content" property that holds the content.

Translated resources have "adapted" and "translated" in addition.

When GETting a translated resource, "content" will always be updated to the 
corresponding master "content". If the translated resource does not exist, a new empty copy
is returned with "content" and "adapted" from master.

If a resource does not have an "id" property it is not yet saved.

Resources
---------

- screens
- languages
- about/:section

 
