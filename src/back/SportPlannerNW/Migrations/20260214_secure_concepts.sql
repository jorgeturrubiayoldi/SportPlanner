-- FIX: Enable RLS on Concept tables to prevent data leaks
ALTER TABLE public.concept_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;

-- POLICY 1: System Data is Publicly Readable (Authenticated Users)
-- We allow any authenticated user to read system categories/concepts
CREATE POLICY "Authenticated users can read system categories" ON public.concept_categories
FOR SELECT
TO authenticated
USING (is_system = true);

CREATE POLICY "Authenticated users can read system concepts" ON public.concepts
FOR SELECT
TO authenticated
USING (is_system = true);

-- POLICY 2: Custom Data (Subscription based)
-- Users can read concepts belonging to their subscription
CREATE POLICY "Users can read their subscription concepts" ON public.concepts
FOR SELECT
TO authenticated
USING (
    subscription_id IN (
        SELECT subscription_id 
        FROM public.subscription_members 
        WHERE user_id = auth.uid()
    )
);

-- POLICY 3: Admin/Owner Write Access (simplified for now)
-- Only allow modifications if user is owner of the subscription associated with the concept
CREATE POLICY "Owners can manage their custom concepts" ON public.concepts
FOR ALL
TO authenticated
USING (
    subscription_id IN (
        SELECT subscription_id 
        FROM public.subscription_members 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
    )
);
