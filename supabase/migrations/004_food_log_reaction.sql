-- Add reaction column to food_logs
ALTER TABLE food_logs
  ADD COLUMN reaction text DEFAULT NULL
  CONSTRAINT food_logs_reaction_check CHECK (reaction IN ('loved', 'okay', 'disliked'));
