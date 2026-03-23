-- Anonim Paylaşım Platformu Veritabanı Şeması (PostgreSQL / Supabase)
-- Bu dosyayı kopyalayıp Supabase SQL Editor'de çalıştırabilirsiniz.
-- Authentication olmadığı için kullanıcı kimlikleri (author_id) yerel bir UUID (örneğin localStorage'den okunup gönderilen bir GUID) olarak saklanacaktır.

-- ==========================================
-- 1. POSTS (Kullanıcı Paylaşımları / Dertler)
-- ==========================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    mood TEXT, -- (Yorgunum, Öfkeliyim, Boşluktayım vb.)
    author_id UUID NOT NULL, -- İstemcide üretilen ve localStorage ile taşınan anonim kullanıcı kimliği
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    replies_count INTEGER DEFAULT 0 NOT NULL
);

-- Optimizasyon: Tarihe ve yazara göre hızlı sorgulama yapabilmek için indeksler
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author_id ON posts(author_id);


-- ==========================================
-- 2. COMMENTS (Paylaşımlara Verilen Yanıtlar / Yorumlar)
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL, -- Yorumu yapan kişinin anonim üretilen kimliği
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimizasyon: Bir gönderinin yorumlarını hızlı çekmek için indeks
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);


-- ==========================================
-- 3. COMMENT_LIKES (Yorum Beğenileri - Mükerrerleri Engeller)
-- ==========================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL, -- Beğenen kişinin kimliği
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Aynı kişi aynı yorumu sadece bir kez beğenebilir kısıtlaması
    UNIQUE(comment_id, author_id)
);


-- ==========================================
-- 4. TETİKLEYİCİLER (Triggers) - Otomatik Sayaçlar
-- ==========================================

-- Yorum eklendikçe veya silindikçe posts tablosundaki replies_count otomatize edilir.
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_replies
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_replies_count();


-- Beğeni eklendikçe veya geri çekildikçe comments tablosundaki likes_count otomatize edilir.
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
