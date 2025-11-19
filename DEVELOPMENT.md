# CollabNote Development Guide

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Copy environment variables
- [ ] Run database migrations
- [ ] Enable Realtime for `notes` table
- [ ] Create `note-images` storage bucket
- [ ] Configure OAuth providers (optional)
- [ ] Deploy Edge Functions (optional)

## Development Workflow

### Running Locally

```bash
pnpm dev
```

### Testing Features

#### 1. Test Authentication
- Sign up with email
- Sign in with GitHub/Google
- Check profile creation in Supabase Dashboard

#### 2. Test RLS (Row Level Security)
- Create a note
- Try to access another user's note ID via URL (should fail)
- Make a note public and access it logged out

#### 3. Test Realtime
- Open same note in two browsers (one incognito)
- Type in one, see updates in the other
- Check presence (online users)

#### 4. Test Storage
- Upload an image to a note
- Check Supabase Storage dashboard
- Verify image appears in note

#### 5. Test Edge Functions
- Click "Summarize" button
- Check network tab for function call
- Verify summary appears

## Common Issues

### Issue: "Invalid JWT"
**Solution**: Check that your environment variables are correct and restart dev server.

### Issue: Realtime not working
**Solution**:
1. Check Database → Replication is enabled for `notes`
2. Verify subscription code in `note-editor.tsx`

### Issue: Storage upload fails
**Solution**:
1. Verify bucket `note-images` exists and is Public
2. Check storage policies are applied

### Issue: OAuth redirect fails
**Solution**: Add `http://localhost:3000/auth/callback` to OAuth provider settings

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

Update OAuth redirect URLs to production domain.

### Deploy Edge Functions

```bash
# Install Supabase CLI
pnpm add -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy summarize-note
```

## Database Migrations

To add new features:

1. Write SQL in `supabase/` directory
2. Test in Supabase SQL Editor
3. Apply to production
4. Document in README

## Performance Tips

- Enable database indexes for frequently queried columns
- Use RLS policies efficiently (avoid complex joins)
- Optimize Realtime subscriptions (filter by user)
- Use CDN for storage (Supabase does this automatically)

## Security Best Practices

- ✅ Never expose service role key in client code
- ✅ Always use RLS policies
- ✅ Validate user input in Edge Functions
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly

## Next Steps

- [ ] Add rich text editor (TipTap, Lexical)
- [ ] Implement vector search UI
- [ ] Add email notifications via Edge Functions
- [ ] Create mobile app with React Native
- [ ] Add GraphQL endpoint demo

---

Happy coding! 🚀
