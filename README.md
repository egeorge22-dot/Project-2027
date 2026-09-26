# Euro Summer '27

The crew's trip hub: everyone's routes on a map, personal dashboards, bookings with files, budgets and ideas.

- **Website:** `index.html` (served by GitHub Pages)
- **Settings:** `config.js` holds the Supabase project URL and the public *anon / publishable* key. The key is safe to publish; the database's security rules decide who sees anything.
- **Data:** stored in Supabase and locked to the crew list. Nothing personal lives in this repository.

Never commit the Supabase `service_role` / secret key, or the `setup.sql` / `seed.sql` files.
