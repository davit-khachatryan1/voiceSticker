# ✅ CORS Updated with Vercel URLs

## Frontend URLs Configured

- **Telegram WebApp**: https://voice-sticker-telegram-webapp-65fp.vercel.app
- **WhatsApp PWA**: https://voice-sticker-whatsapp-pwa.vercel.app

Both URLs have been added to `worker/wrangler.toml` → `ALLOWED_ORIGINS`

---

## Next Step: Redeploy Worker

Update the Worker with the new CORS settings:

```bash
cd worker
wrangler deploy
```

This will update the Worker's CORS headers to allow requests from both frontends.

---

## After Redeploying Worker

### 1. Set Telegram Bot Domain

Message @BotFather:

```
/setdomain
```

Select your bot (`@fun1Time1Bot`), then enter:

```
https://voice-sticker-telegram-webapp-65fp.vercel.app
```

### 2. Test Everything

**Test Telegram:**
1. Open any Telegram chat
2. Type `@fun1Time1Bot`
3. Tap "Open WebApp" or "Record VoiceSticker"
4. Should open your WebApp

**Test WhatsApp:**
1. Open https://voice-sticker-whatsapp-pwa.vercel.app
2. Select style & mood
3. Record → Share to WhatsApp

---

## ✅ Current Status

- [x] Bot token configured
- [x] Frontends deployed to Vercel
- [x] CORS URLs updated
- [ ] Worker redeployed with new CORS
- [ ] Bot domain set in @BotFather
- [ ] Tested Telegram flow
- [ ] Tested WhatsApp flow

---

**Ready to redeploy!** Run `wrangler deploy` in the worker directory.

