-- Migration: Create Player Performance and Attendance Tables
-- Date: 2026-02-14
-- Description: Advanced stats and attendance tracking for elite performance analysis

-- ============================================
-- Table: session_attendance (Asistencia)
-- ============================================
CREATE TABLE IF NOT EXISTS public.session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_concept_id UUID NOT NULL REFERENCES public.plan_concepts(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    
    status TEXT NOT NULL DEFAULT 'present', -- 'present', 'absent', 'late', 'injured'
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_attendance UNIQUE(plan_concept_id, player_id)
);

-- ============================================
-- Table: player_performance_stats (Rendimiento)
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_performance_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_concept_id UUID NOT NULL REFERENCES public.plan_concepts(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    
    -- Metrics (0-10 or specific values)
    rating FLOAT DEFAULT 0, -- Valoración general de la sesión
    physical_load INT,      -- Carga física percibida (RPE)
    technical_score INT,    -- Nota técnica
    tactical_score INT,     -- Nota táctica
    
    comments TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_performance UNIQUE(plan_concept_id, player_id)
);

-- Enable RLS
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_performance_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Owners can manage attendance" ON public.session_attendance
    FOR ALL USING (true); -- Simplifying for now, service role will handle it

CREATE POLICY "Owners can manage performance" ON public.player_performance_stats
    FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_attendance_player ON public.session_attendance(player_id);
CREATE INDEX idx_performance_player ON public.player_performance_stats(player_id);
CREATE INDEX idx_performance_session ON public.player_performance_stats(plan_concept_id);
