-- Create a table to log webhook events (simulating external delivery)
create table if not exists webhook_logs (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Function to handle the trigger
create or replace function handle_new_public_note()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only trigger for public notes
  if new.is_public = true then
    -- Log the event
    insert into webhook_logs (event_type, payload)
    values ('new_public_note', row_to_json(new));

    -- NOTE: In a production Supabase environment with pg_net enabled,
    -- you would uncomment the following to actually call the Edge Function:
    /*
    perform net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/notify-discord',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := row_to_json(new)
    );
    */
  end if;
  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_new_public_note on public.notes;
create trigger on_new_public_note
after insert on public.notes
for each row
execute function handle_new_public_note();
