-- user_permission.permissions is varchar: slug1;slug2;slug3 (not JSON).
-- Re-login after running so JWT picks up new slugs.

UPDATE user_permission
SET
  permissions = CONCAT(TRIM(BOTH ';' FROM permissions), ';see_community_posts;delete_community_posts'),
  updated_at = NOW()
WHERE (
  permissions LIKE '%book_reveiw%'
  OR permissions LIKE '%assign_roles%'
)
AND permissions NOT LIKE '%see_community_posts%';
