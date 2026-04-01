-- ==========================================
-- 5. POLLS (Anonim Anketler)
-- ==========================================
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_votes INTEGER DEFAULT 0 NOT NULL
);

-- Optimizasyon: Tarihe göre hızlı sorgulama
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);

-- ==========================================
-- 6. POLL_OPTIONS (Anket Seçenekleri)
-- ==========================================
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0 NOT NULL
);

-- Optimizasyon: Bir anketin seçeneklerini hızlı çekmek için
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);

-- ==========================================
-- 7. POLL_VOTES (Anket Oyları - Mükerrerleri Engeller)
-- ==========================================
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Bir kişi (anonim id) aynı ankette sadece BİR KEZ oy kullanabilir
    UNIQUE(poll_id, author_id)
);


-- ==========================================
-- 8. TETİKLEYİCİLER (Triggers) - Otomatik Anket Sayaçları
-- ==========================================

-- Oy eklendikçe veya silindikçe anketin total_votes sayısını arttırır ve option_votes'u günceller
CREATE OR REPLACE FUNCTION update_poll_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
        UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = NEW.option_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE polls SET total_votes = total_votes - 1 WHERE id = OLD.poll_id;
        UPDATE poll_options SET votes_count = votes_count - 1 WHERE id = OLD.option_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_votes
AFTER INSERT OR DELETE ON poll_votes
FOR EACH ROW EXECUTE FUNCTION update_poll_votes_count();
