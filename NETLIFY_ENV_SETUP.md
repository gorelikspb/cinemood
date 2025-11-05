# 🔧 Автоматическое добавление переменных в Netlify

## Способ 1: Через Netlify CLI (самый простой)

### Установите Netlify CLI:

```bash
npm install -g netlify-cli
```

### Войдите в Netlify:

```bash
netlify login
```

### Добавьте переменную:

```bash
netlify env:set REACT_APP_API_URL "https://cinemood-production.up.railway.app/api" --context production
```

### Или для всех окружений:

```bash
netlify env:set REACT_APP_API_URL "https://cinemood-production.up.railway.app/api"
```

### Пересоберите проект:

```bash
netlify deploy --prod
```

---

## Способ 2: Через PowerShell скрипт (если установлен Netlify CLI)

Создайте файл `setup-netlify-env.ps1`:

```powershell
# Установите Netlify CLI (если еще не установлен)
# npm install -g netlify-cli

# Войдите в Netlify (первый раз)
# netlify login

# Добавьте переменные
netlify env:set REACT_APP_API_URL "https://cinemood-production.up.railway.app/api" --context production
netlify env:set REACT_APP_GA4_MEASUREMENT_ID "G-4B5R6S0DLK" --context production
netlify env:set REACT_APP_CLARITY_PROJECT_ID "ваш-project-id" --context production

# Пересоберите проект
netlify deploy --prod
```

---

## Способ 3: Вручную через Dashboard (самый надежный)

1. Откройте: https://app.netlify.com
2. Ваш проект → Site settings → Environment variables
3. Добавьте:
   - `REACT_APP_API_URL` = `https://cinemood-production.up.railway.app/api`
4. Deploys → Trigger deploy → Deploy site

---

## ⚠️ Важно:

После добавления переменной **обязательно пересоберите проект**, иначе переменная не будет использоваться!

Хотите, чтобы я создал PowerShell скрипт для автоматизации?

