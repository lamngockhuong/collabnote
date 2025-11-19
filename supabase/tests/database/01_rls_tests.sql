begin;
select plan(7); -- Number of tests

-- Helper function for auth
create schema if not exists tests;
create or replace function tests.authenticate_as(user_id uuid)
returns void
language plpgsql
as $$
begin
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
end;
$$;

grant usage on schema tests to public;
grant execute on function tests.authenticate_as to public;

-- 1. Check if tables exist
select has_table('notes');
select has_table('profiles');

-- 2. Setup Test Users
-- Create a test user (simulating auth.users)
-- The trigger 'on_auth_user_created' will automatically create the profile!
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000001', 'user1@test.com'),
  ('00000000-0000-0000-0000-000000000002', 'user2@test.com');

-- We can update the profiles if we want to set usernames, but it's not strictly necessary for RLS test
update public.profiles set username = 'user1' where id = '00000000-0000-0000-0000-000000000001';
update public.profiles set username = 'user2' where id = '00000000-0000-0000-0000-000000000002';

-- 3. Test RLS: Private Note
-- Switch to User 1
select tests.authenticate_as('00000000-0000-0000-0000-000000000001');

-- User 1 creates a private note
insert into public.notes (title, content, is_public, owner_id)
values ('Private Note', 'Secret', false, '00000000-0000-0000-0000-000000000001');

-- Verify User 1 can see it
select results_eq(
  $$ select title from public.notes where title = 'Private Note' $$,
  $$ values ('Private Note') $$,
  'Owner can see their own private note'
);

-- Switch to User 2
select tests.authenticate_as('00000000-0000-0000-0000-000000000002');

-- Verify User 2 CANNOT see it
select is_empty(
  $$ select * from public.notes where title = 'Private Note' $$,
  'Other user cannot see private note'
);

-- 4. Test RLS: Public Note
-- Switch back to User 1
select tests.authenticate_as('00000000-0000-0000-0000-000000000001');

-- User 1 creates a public note
insert into public.notes (title, content, is_public, owner_id)
values ('Public Note', 'Everyone see this', true, '00000000-0000-0000-0000-000000000001');

-- Switch to User 2
select tests.authenticate_as('00000000-0000-0000-0000-000000000002');

-- Verify User 2 CAN see it
select results_eq(
  $$ select title from public.notes where title = 'Public Note' $$,
  $$ values ('Public Note') $$,
  'Other user can see public note'
);

-- 5. Test RLS: Update Policy
-- User 2 tries to update User 1's public note (should fail silently - 0 rows updated)
update public.notes set content = 'Hacked' where title = 'Public Note';

select results_eq(
  $$ select content from public.notes where title = 'Public Note' $$,
  $$ values ('Everyone see this') $$,
  'User cannot update others public note (content remains unchanged)'
);

-- 6. Test RLS: Delete Policy
-- User 2 tries to delete User 1's public note (should fail/do nothing)
delete from public.notes where title = 'Public Note';

select results_eq(
  $$ select title from public.notes where title = 'Public Note' $$,
  $$ values ('Public Note') $$,
  'User cannot delete others public note'
);

select * from finish();
rollback;
