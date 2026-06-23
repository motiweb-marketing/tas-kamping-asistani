-- Excel import bazen @ veya büyük harf ile kaydetmiş olabilir; giriş normalize ediyor ama DB'yi de hizala
UPDATE users
SET username = lower(ltrim(trim(username), '@'))
WHERE username <> lower(ltrim(trim(username), '@'));
