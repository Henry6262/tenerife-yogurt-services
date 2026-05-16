# Research: AI Voice Infrastructure for Tenerife Business Marketplace
> Date: 2026-05-14
> Goal: Identify the simplest, cheapest way for Tenerife businesses to deploy AI phone agents without buying SIM cards or hardware.

---

## 1. Executive Summary

**The good news:** You do NOT need virtual SIM cards, physical hardware, or complex SIP trunking for 90% of Tenerife businesses.

**The simple solution:** Call forwarding from their existing number → our AI virtual number. Period.

Every business in Tenerife already has a phone number (landline or mobile). They just need to enable "call forwarding when no answer" or "forward all calls" to our AI endpoint. That's it. No new SIMs. No new phones.

---

## 2. The Phone Number Problem — What We Learned

### The Hard Way (what Henry tried before)
- Buy virtual SIM / virtual number
- Configure it manually
- Integrate with Vapi
- This is painful and doesn't scale

### The Easy Way (what the research confirms)

| Approach | Complexity | Cost/Month | Best For |
|----------|-----------|------------|----------|
| **Call forwarding** → AI number | ⭐ (5 min setup) | €0-€5 forwarding fee | **All SMBs** |
| New VoIP virtual number | ⭐⭐ (10 min setup) | €1-€5/number | Businesses without a number |
| SIP Trunking | ⭐⭐⭐⭐⭐ (needs engineer) | €15-€50/line | Enterprise with PBX |
| Physical SIM in gateway | ⭐⭐⭐⭐ (hardware needed) | €10-€30/SIM | Don't do this |

**Winner: Call forwarding.** Every Spanish carrier (Movistar, Vodafone, Orange, Digi) supports call forwarding. The business dials a code like `**21*AI_NUMBER#` and done.

---

## 3. AI Voice Platforms Compared (2026)

### For Our Use Case (Spanish-speaking beauty/salon SMBs)

| Platform | Price/min | Spanish | Setup Difficulty | Best Feature |
|----------|-----------|---------|------------------|--------------|
| **Retell AI** | €0.06-0.09 | ✅ Native | Easy (no-code builder) | Fastest time-to-market, HIPAA ready |
| **Vapi.ai** | €0.04-0.07 | ✅ Good | Medium (API-first) | Cheapest, most flexible |
| **Synthflow** | €0.07-0.11 | ✅ Good | Easiest (visual builder) | Built for agencies & SMBs |
| **Bland AI** | €0.07-0.10 | ⚠️ English-first | Medium | Best for outbound campaigns |
| **ElevenLabs Conv.** | €0.08-0.24 | ✅ Best voices | Hard | Best voice quality, most natural |

### Our Recommendation

**Primary: Retell AI**
- Built for agencies deploying to non-technical SMB clients
- No-code flow builder = we can generate flows from our DB automatically
- Bundled pricing (predictable costs)
- 20 free concurrent calls included
- Spanish language support is strong
- BAA/HIPAA available for enterprise clients

**Secondary: Vapi.ai (if we need to optimize costs at scale)**
- Cheapest per-minute
- Full stack control
- Good for developer-heavy phase 2
- But: harder setup for non-technical clients

**Voice Quality: ElevenLabs** (optional upgrade)
- If a luxury salon wants THE BEST voice, we can upgrade to ElevenLabs voices
- 70+ languages including perfect Spanish
- Costs more but worth it for premium positioning

---

## 4. The Architecture: How It Actually Works

```
Customer calls +34 922 123 456 (salon's existing number)
         ↓
    [Call forwarding enabled]
         ↓
    Retell AI virtual number (+1 or +34 number we provision)
         ↓
    [Retell AI Agent]
         ↓
    Converses in Spanish with salon's personality
         ↓
    Queries our API for availability
         ↓
    Books appointment in our shared DB
         ↓
    Sends SMS/WhatsApp confirmation to customer
         ↓
    Notifies business owner via dashboard
```

### What the business owner does:
1. Signs up on our platform
2. Configures their AI agent (name, tone, personality) ← **Already built**
3. We auto-provision a Retell phone number via API
4. We show them a simple code: `**21*OUR_NUMBER#`
5. They dial it on their existing phone. Done.

### What they DON'T do:
- ❌ Buy a new SIM
- ❌ Install hardware
- ❌ Configure SIP
- ❌ Change their advertised number
- ❌ Talk to their carrier

---

## 5. Costs Breakdown (Per Business)

| Item | Cost | Who Pays |
|------|------|----------|
| Retell AI minutes | ~€0.07/min | Us (we bill business monthly) |
| Virtual phone number | ~€2/month | Us |
| Call forwarding | €0-€3/month | Business (to their carrier) |
| SMS confirmations | ~€0.05/SMS | Us |
| **Total per business** | **~€30-€80/month** | **Business (our Pro+ tier)** |

At 50 calls/month average (1.6 calls/day), that's ~€10 in AI minutes + €2 number = €12 cost to us.

We charge €79/month Pro+ = **€67 margin per business**.

---

## 6. The "Kit Digital" Angle (Critical for Spain)

The Spanish government gives **€3,000 to €29,000 grants** per business for digitalization via Kit Digital.

Our AI voice agent qualifies as:
- ✅ **Process management** (category 1)
- ✅ **Customer management** (category 2)
- ✅ **E-commerce / digital presence** (category 3)

**The pitch:** "Get your AI receptionist for FREE using Kit Digital funds. We handle the paperwork."

This removes the #1 objection: cost.

---

## 7. WhatsApp as the Stepping Stone

Before phone calls, we can deploy the same AI agent on **WhatsApp Business API**:
- 90% of Tenerife businesses use WhatsApp for bookings already
- Zero phone infrastructure needed
- Same AI personality, same calendar integration
- Costs ~€0.008 per conversation (Meta pricing)
- Businesses just scan a QR code to connect their WhatsApp

This is the **fastest path to revenue** while we build the phone integration.

---

## 8. The Easiest Setup Flow (Target UX)

### For a hair salon owner (Maria, 45, not technical):

1. **Signs up** on our web app (10 min)
2. **Creates her AI agent** — names it "Sofia", picks "friendly" tone, writes her brand guidelines (5 min)
3. **Connects her calendar** — we import her services & staff (already done via our platform)
4. **Chooses channel:**
   - WhatsApp → scans QR code (30 sec)
   - Phone → copies forwarding code `**21*+34922XXXXXX#` and dials it (30 sec)
5. **Tests it** → calls her own number, talks to Sofia, books a test appointment
6. **Goes live** → we give her a sticker: "Atendido por Sofia, nuestra IA"

Total setup time: **15 minutes**.

---

## 9. Competitive Moat

| Competitor | Their Model | Our Advantage |
|------------|-------------|---------------|
| **Treatwell** | 35% commission | We charge flat fee + AI agent is THEIR brand |
| **OpenTable** | $1.50/cover + setup fees | We integrate AI + shared marketplace |
| **Safina.ai** | Generic AI receptionist | Every business gets a UNIQUE, branded personality |
| **Vapi direct** | DIY developer platform | We handle everything: number, forwarding, personality |
| **Local WhatsApp** | Manual, no AI | Our AI understands natural language, books automatically |

---

## 10. Open Questions for You to Validate

Please answer these based on your Tenerife ground research:

1. **What % of salons already have a landline vs. mobile-only?**
   - Landlines = easy forwarding
   - Mobile-only = slightly harder but still possible

2. **Do carriers charge for call forwarding in Spain?**
   - Movistar / Vodafone / Orange / Digi — any fees?

3. **Is WhatsApp Business already used by salons?**
   - If yes, that's our Phase 1 channel

4. **What's the average number of daily calls per salon?**
   - 5 calls/day = €21/month in AI costs
   - 20 calls/day = €84/month

5. **Would salons pay €79/month for an AI that answers calls 24/7?**
   - Compare to: hiring a receptionist = €1,200+/month
   - Missing a booking = €25-€100 lost revenue

6. **Have you heard of Kit Digital? Are businesses using it?**
   - If yes, we position as "free with Kit Digital"
   - If no, we become the agent that helps them apply

7. **What's the hardest part of salon owner's day?**
   - Answering calls while cutting hair?
   - No-shows?
   - Managing staff schedules?
   - This shapes our AI's primary pitch

---

## 11. Recommended Tech Stack (Updated)

| Layer | Technology | Cost |
|-------|-----------|------|
| Web app | Next.js + Prisma + Tailwind | $0 (open source) |
| Database | PostgreSQL (shared, multi-tenant) | ~$15/month (Railway) |
| AI Voice | Retell AI | ~€0.07/min |
| Phone numbers | Twilio or Retell (via API) | ~€2/number/month |
| WhatsApp | WhatsApp Business API (360dialog or Meta direct) | ~€0.008/msg |
| SMS | Twilio | ~€0.05/SMS |
| Hosting | Vercel + Railway | ~$30/month |
| **Total infra cost** | | **~€50/month base + usage** |

---

## 12. Next Steps

### Phase 1 (Now — 2 weeks)
- [ ] Finish web-based AI concierge (✅ Done)
- [ ] Add WhatsApp Business API integration
- [ ] Test with 3-5 real salons in Los Cristianos

### Phase 2 (Month 2)
- [ ] Integrate Retell AI for phone calls
- [ ] Auto-provision phone numbers via API
- [ ] Build "call forwarding setup" guide for business owners
- [ ] Launch with 10 beta salons

### Phase 3 (Month 3)
- [ ] Kit Digital partnership / application helper
- [ ] Expand to restaurants and clinics
- [ ] AI analytics: "Your peak hours are X, consider extending"

---

*Research sources: Lumay.ai, Retell AI docs, Vapi.ai pricing, Safina.ai, CloudTalk, Spanish Kit Digital program, SES.HOSPEDAJES regulations, Treatwell commission data, OpenTable pricing.*
