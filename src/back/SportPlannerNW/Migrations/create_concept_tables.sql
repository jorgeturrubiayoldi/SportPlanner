-- Categorías jerárquicas de conceptos
CREATE TABLE IF NOT EXISTS concept_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL,
    parent_id UUID REFERENCES concept_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conceptos/técnicas de entrenamiento
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_category_id UUID NOT NULL REFERENCES concept_categories(id),
    subscription_id UUID,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    is_system BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_concept_categories_parent ON concept_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_concepts_category ON concepts(concept_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_sport ON concept_categories(sport_id);

-- Insertar categorías base
INSERT INTO concept_categories (sport_id, name, is_system) 
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ataque', true
WHERE NOT EXISTS (SELECT 1 FROM concept_categories WHERE name = 'Ataque');

INSERT INTO concept_categories (sport_id, name, is_system) 
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Defensa', true
WHERE NOT EXISTS (SELECT 1 FROM concept_categories WHERE name = 'Defensa');
