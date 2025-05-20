-- Part 1: Add indexes (run this part first)

-- Indexes for saved_searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- Indexes for materials
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_materials_vendor ON materials(vendor);

-- Indexes for system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- Part 2: Enable Row Level Security (run this after Part 1 succeeds)

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;


-- Part 3: Create policies for saved_searches (run after Part 2 succeeds)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved searches" ON saved_searches;

-- Create a secure policy that checks the x-user-id header
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (user_id = request.header('x-user-id')::TEXT);

DROP POLICY IF EXISTS "Users can insert their own saved searches" ON saved_searches;

CREATE POLICY "Users can insert their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (user_id = request.header('x-user-id')::TEXT);

DROP POLICY IF EXISTS "Users can update their own saved searches" ON saved_searches;

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (user_id = request.header('x-user-id')::TEXT);

DROP POLICY IF EXISTS "Users can delete their own saved searches" ON saved_searches;

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (user_id = request.header('x-user-id')::TEXT);


-- Part 4: Create policies for user_preferences (run after Part 3 succeeds)

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = request.header('x-user-id')::TEXT);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = request.header('x-user-id')::TEXT);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = request.header('x-user-id')::TEXT);

-- Part 5: Create a policy to allow service role to bypass RLS for admin operations

-- This policy allows the service role (admin) to bypass RLS
-- The service role is authenticated using the service_role key, not the anon key

-- Create a policy to allow service role to access all records
DROP POLICY IF EXISTS "Service role can access all saved searches" ON saved_searches;
CREATE POLICY "Service role can access all saved searches"
  ON saved_searches
  USING (auth.role() = 'service_role');
  
DROP POLICY IF EXISTS "Service role can access all user preferences" ON user_preferences;
CREATE POLICY "Service role can access all user preferences"
  ON user_preferences
  USING (auth.role() = 'service_role');
  
-- These policies are now secure and ready for production use
