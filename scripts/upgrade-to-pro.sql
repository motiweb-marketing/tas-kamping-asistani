-- Kamp Asistanı: Deneme kampını Pro'ya yükselt
-- Supabase SQL Editor'da çalıştırın.
-- Organizatörün kullanıcı adı/şifresi DEĞİŞMEZ — sadece limitler açılır.

-- Kamp adına göre:
UPDATE campaigns
SET plan_tier = 'paid', max_tents = 99, max_users = 99
WHERE name = 'KAMP_ADI_BURAYA';

-- veya kamp id'sine göre:
-- UPDATE campaigns
-- SET plan_tier = 'paid', max_tents = 99, max_users = 99
-- WHERE id = 'uuid-buraya';
