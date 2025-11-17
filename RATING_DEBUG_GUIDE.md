# Rating System Debug Guide

## Issue
Rating is being saved as NULL in Supabase and not displaying in the UI.

## Step-by-Step Debugging

### 1. Verify Database Schema
Run `VERIFY_RATING_COLUMNS.sql` in Supabase SQL Editor to check if columns exist.

**Expected Result:**
```
column_name     | data_type | is_nullable | column_default
----------------|-----------|-------------|---------------
patient_status  | text      | YES         | NULL
rating          | integer   | YES         | NULL
rating_comment  | text      | YES         | NULL
```

If columns are missing, run the ALTER TABLE statement from that file.

---

### 2. Test Rating Submission

**Steps:**
1. Open browser console (F12)
2. Start a new symptom check conversation
3. Complete the conversation and save it
4. Rate the conversation (click stars)
5. Add optional comment
6. Click "Submit Rating"

**Check Console Logs:**
- Look for: `Submitting rating: { rating: X, ratingComment: "...", conversationId: "..." }`
- Look for: `Rating update result: { data: [...], error: null }`

**If you see error:**
- Check the error message
- Verify the conversation ID is not null
- Check if you have permission to update the table

---

### 3. Verify in Supabase

Go to Supabase Dashboard → Table Editor → ai_conversations

**Check the latest conversation:**
- Find the row by ID (use the conversationId from console)
- Verify `rating` column has a number (1-5)
- Verify `rating_comment` has your text (if entered)

**If rating is NULL:**
- The UPDATE query failed
- Check RLS policies on `ai_conversations` table
- User needs UPDATE permission on their own rows

---

### 4. Check RLS Policies

Run this in SQL Editor:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'ai_conversations';
```

**You should see policies like:**
- Users can insert their own conversations
- Users can view their own conversations
- **Users can update their own conversations** ← IMPORTANT!

**If UPDATE policy is missing, add it:**
```sql
CREATE POLICY "Users can update their own conversations" 
ON ai_conversations
FOR UPDATE 
USING (auth.uid() = user_id);
```

---

### 5. Test UI Display

After rating is successfully saved:

1. Go to Patient Dashboard
2. Check "Recent Conversations" sidebar
3. Click "View All" or navigate to `/history`
4. The rated conversation should show:
   - Small stars (⭐⭐⭐⭐⭐) next to the title
   - When expanded: Full rating card with yellow background
   - Rating score (e.g., "4/5")
   - Your comment in italic quotes

**Check Console:**
- Look for: `Fetched conversations: [...]`
- Look for: `First conversation rating: X` (should be a number, not null)

**If rating doesn't show:**
- Hard refresh the page (Ctrl+Shift+R)
- Check if `refreshTrigger` is incrementing
- Verify the conversation was actually updated in Supabase

---

### 6. Quick Fix - Manual Update

If you want to test the UI without waiting:

```sql
-- Update a specific conversation with a test rating
UPDATE ai_conversations
SET 
  rating = 5,
  rating_comment = 'Test rating from SQL'
WHERE id = 'YOUR_CONVERSATION_ID_HERE';
```

Then hard refresh your app and check if it displays.

---

## Common Issues & Solutions

### Issue: "No conversation ID available"
**Cause:** Conversation wasn't saved before rating
**Solution:** Ensure you click "Save" before rating

### Issue: Rating updates but shows NULL
**Cause:** Wrong column type or constraint violation
**Solution:** Verify column is INTEGER, check for CHECK constraint

### Issue: Rating doesn't display after manual update
**Cause:** Frontend cache or query issue
**Solution:** 
- Hard refresh (Ctrl+Shift+R)
- Check browser console for fetch errors
- Verify TypeScript interface matches DB schema

### Issue: Update permission denied
**Cause:** Missing RLS policy
**Solution:** Add UPDATE policy as shown in Step 4

---

## Latest Code Changes

### SymptomChecker.tsx
- Added `savedConversationId` state to track conversation ID
- Modified insert to return ID: `.select('id').single()`
- Updated rating submission to use `.eq('id', savedConversationId)`
- Added detailed console logging
- Triggers `onClose()` to refresh parent after rating

### ConversationHistory.tsx
- Added console logging to see fetched data
- Displays rating with yellow background card
- Shows star icons (filled vs empty)
- Shows rating comment in italic quotes
- Added patient_status display (if present)

### AIConversation Interface (supabase.ts)
- Added `rating?: number`
- Added `rating_comment?: string`
- Added `patient_status?: string`

---

## Test This Now

1. Run `VERIFY_RATING_COLUMNS.sql` - ensure columns exist
2. Complete a new symptom check
3. Rate it with 4 stars and comment "Testing"
4. Check console for logs
5. Check Supabase table for the values
6. Go to History page - verify it displays
7. Report back what you see!
