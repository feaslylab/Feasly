-- Alert preferences per user
CREATE TABLE IF NOT EXISTS public.alert_pref (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  irr_threshold numeric DEFAULT 0.08,   -- 8%
  npv_threshold numeric DEFAULT 0       -- AED
);

-- E-mail queue
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  subject text NOT NULL,
  body text NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS (users see only their rows)
ALTER TABLE public.alert_pref ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rows" ON public.alert_pref 
  USING (user_id = auth.uid()) 
  WITH CHECK (true);

CREATE POLICY "own rows" ON public.email_queue 
  USING (user_id = auth.uid());