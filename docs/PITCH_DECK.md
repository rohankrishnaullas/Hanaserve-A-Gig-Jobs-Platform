# Hanaserve - Pitch Deck Content

## 📊 Slide-by-Slide Guide (12 Slides)

---

## SLIDE 1: Title Slide
**Visual**: Hanaserve logo (🌸) + tagline + Live Demo QR code

### Content:
```
🌸 HANASERVE

"Local services, powered by natural language."

The service layer for AI assistants

Live Demo: black-tree-0a168a700.1.azurestaticapps.net

[Founder names and contact]
```

### Speaker Notes:
> "Hi, I'm Rohan, founder of Hanaserve. We're building India's first natural language-first gig service layer - designed to plug into ChatGPT, Siri, Gemini, and Copilot so anyone can request local services through the AI assistant they already use."

---

## SLIDE 2: The Problem (Part 1 - Demand Side)
**Visual**: Frustrated person with 10+ app icons around them

### Content:
```
😤 THE PROBLEM: For Service Seekers

"I need someone to take my bike to the 
service center 15km away, pick it up once 
it's serviced, and bring it back"

Current Reality:
❌ Search 5+ apps (UrbanClap, Dunzo, local groups...)
❌ None handle specific, multi-step requests
❌ Quality & pricing opaque
❌ No single place for "long-tail" services

🕐 Average time to find the right help: 2+ hours
```

### Speaker Notes:
> "Imagine you need someone to take your bike to the service center 15km away, wait or come back later, pick it up once it's done, and bring it back home. Where do you go? You'd search 5 different apps, post in WhatsApp groups, call local contacts, and still struggle. Existing platforms are category-bound and can't handle this multi-step, specific request."

---

## SLIDE 3: The Problem (Part 2 - Supply Side)
**Visual**: Multiple people (student, retiree, homemaker) with skills icons

### Content:
```
😤 THE PROBLEM: For Service Providers

300 million+ informal workers in India can't easily monetize skills

Current Reality:
❌ Stuck in single categories ("I'm ONLY a tutor")
❌ Platform friction excludes non-English speakers
❌ No discovery for diverse skill sets
❌ Pricing is opaque, unfair, or auction-based

Example: A college student who can:
• Tutor in Math ✓
• Help with coding ✓
• Run errands ✓
• Pet sit ✓

→ But platforms only see them as ONE thing
```

### Speaker Notes:
> "On the supply side, India has 300 million informal workers - students, retirees, homemakers - with diverse skills. But platforms pigeonhole them. A student who can tutor, code, AND pet-sit gets listed as just one. And if they don't speak English fluently, onboarding is a nightmare."
It should be like Bumble for jobs! Quick to onboard and quickly start matching :)


---

## SLIDE 4: Our Solution
**Visual**: Phone mockup showing integration with ChatGPT/Siri/Gemini

### Content:
```
💡 HANASERVE: Natural Language-First Service Layer

🔌 NOT another app. A SERVICE LAYER that plugs into:
• ChatGPT plugins
• Siri/Apple Intelligence
• Google Gemini
• Microsoft Copilot
• WhatsApp bots

FOR REQUESTERS:
"Hey Siri, find someone to walk my dog tomorrow"
→ Hanaserve powers the matching behind the scenes

FOR PROVIDERS:
→ Voice onboarding in ANY language
→ Multi-skill profile in 2 minutes
→ Discoverable across ALL AI assistants

🌸 Hana = Our standalone app + the engine for AI assistants
```

### Speaker Notes:
> "Hanaserve is NOT a super app. We're building the natural language-first service layer for local gigs. Today we have a standalone app, but our vision is to plug into ChatGPT, Siri, Gemini, and Copilot - so users can request services through whatever AI assistant they already use. We become the infrastructure, not another app to download."

---

## SLIDE 5: Live Demo Screenshot
**Visual**: Screenshot of the app showing the Hana chat interface

### Content:
```
🚀 LIVE MVP

[App Screenshot Here]

Try it now: black-tree-0a168a700.1.azurestaticapps.net

✅ Voice-first interface (English, expanding to vernacular)
✅ AI assistant "Hana" guides conversations
✅ Provider & Requester flows
✅ Smart skill suggestions
✅ Location-based matching
✅ Fair rate recommendations

Built with: React + Azure OpenAI + Azure Speech Services
```

### Speaker Notes:
> "We have a working MVP live right now. Let me show you - or scan this QR code. Users can speak to Hana, our AI assistant, who guides them through finding work or hiring help. The entire experience is conversational, not form-filling."

---

## SLIDE 6: How It Works
**Visual**: 3-step flow diagram

### Content:
```
🔄 HOW IT WORKS

REQUESTERS                          PROVIDERS
    │                                   │
    ▼                                   ▼
┌─────────────────┐            ┌─────────────────┐
│ 1. SPEAK        │            │ 1. SPEAK        │
│ "I need help    │            │ "I can do       │
│  walking my dog"│            │  tutoring,      │
│                 │            │  pet care..."   │
└────────┬────────┘            └────────┬────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ 2. AI MATCHES   │◄──────────►│ 2. GET NOTIFIED │
│ Location + Skill│            │ When jobs match │
│ + Fair pricing  │            │ your skills     │
└────────┬────────┘            └────────┬────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ 3. CONNECT      │◄──────────►│ 3. ACCEPT/EARN  │
│ Get help fast   │            │ Build reputation│
└─────────────────┘            └─────────────────┘
```

### Speaker Notes:
> "The flow is simple: Requesters speak their need, our AI matches them with nearby providers who have the right skills, suggests a fair rate, and connects them. Providers get notified of matching jobs and can accept with one tap."

---

## SLIDE 7: Market Opportunity
**Visual**: TAM/SAM/SOM circles

### Content:
```
📈 MARKET OPPORTUNITY

TAM: $50B+
India's home services + gig economy market

SAM: $8B
Urban India, organized gig services
(UrbanClap: $600M, Swiggy Genie growing 40% YoY)

SOM: $200M
Hyderabad + Bangalore, long-tail services
(Year 3 target: 2% of SAM)

🎯 Why now?
• Voice AI adoption exploding (Alexa, GPT)
• 500M+ Indians prefer voice over typing
• Gig economy growing 17% CAGR
• Fragmentation creates opportunity
```

### Speaker Notes:
> "India's gig and home services market is $50+ billion and growing 17% annually. Our initial focus - long-tail services in Hyderabad and Bangalore - is a $200 million opportunity. And the timing is perfect: voice AI adoption is exploding, and 500 million Indians prefer speaking over typing."

---

## SLIDE 8: Business Model
**Visual**: Revenue flow diagram

### Content:
```
💰 BUSINESS MODEL

Phase 1 (MVP → PMF):
• FREE for users
• Build liquidity, trust, usage patterns

Phase 2 (Scale):
┌──────────────────────────────────────┐
│ Transaction Commission     10-15%   │
│ (on completed jobs)                 │
├──────────────────────────────────────┤
│ Provider Subscriptions     ₹199-499 │
│ (priority matching, badges)   /mo   │
├──────────────────────────────────────┤
│ Enterprise/SMB Plans       Custom   │
│ (bulk hiring, concierge)            │
└──────────────────────────────────────┘

Unit Economics Target:
• AOV: ₹500-2000/job
• Take rate: 12%
• CAC payback: <3 months
```

### Speaker Notes:
> "Our business model is transaction-based - we take 10-15% commission on completed jobs. We'll also offer provider subscriptions for priority matching and enterprise plans for SMBs who need recurring help. Our target AOV is ₹500-2000 per job."

---

## SLIDE 9: Competitive Landscape
**Visual**: 2x2 matrix positioning

### Content:
```
🏆 WHY WE WIN

                    Plugin/Infrastructure
                        ↑
                        │
    Hanaserve ⭐        │         (Future: OpenAI plugins)
    NL-first,           │
    AI-native           │
                        │
Category ◄──────────────┼──────────────► Dynamic
Bound                   │              Categories
                        │
    UrbanClap           │         TaskRabbit
    Housejoy            │         (US only)
    Swiggy Genie        │
                        │
                        ↓
                    Standalone App Only

Our Moats:
✓ Natural language-first architecture
✓ Built for AI assistant integration (ChatGPT, Siri, Gemini, Copilot)
✓ Multi-skill provider identity
✓ Vernacular language support
✓ NOT competing with apps - powering AI assistants
```

### Speaker Notes:
> "UrbanClap and others are category-bound and form-based. We're building something fundamentally different - voice-first, category-free, AI-powered. This makes us accessible to millions who prefer speaking, and valuable to providers who have diverse skills."

---

## SLIDE 10: Traction & Roadmap
**Visual**: Timeline with milestones

### Content:
```
📍 CURRENT STATUS & ROADMAP

✅ DONE (Dec 2025)
• MVP live on Azure (standalone app)
• Natural language-first UI working
• AI assistant (Hana) operational
• Provider & Requester flows complete

🗺️ VERSION ROADMAP
┌─────────────────┬──────────────────────────────────────────────────┐
│ Version         │ Features                                         │
├─────────────────┼──────────────────────────────────────────────────┤
│ V0.1 (Current)  │ MVP - voice-first, localStorage, basic matching  │
│ V0.2            │ Backend API, auth, real-time notifications,      │
│                 │ basic payments                                   │
│ V0.3            │ Provider KYC, ratings/reviews, multilingual NLU  │
│ V0.4            │ Escrow, WhatsApp/voice bots, automation agents   │
└─────────────────┴──────────────────────────────────────────────────┘

🎯 TIMELINE
Q1 2026: Closed beta (50 providers, 100 requesters)
Q2 2026: V0.2 - Backend API, payments, real-time matching
Q3 2026: Public launch in Hyderabad + WhatsApp bot
Q4 2026: V0.3 - Bangalore expansion + KYC

🔌 PLUGIN ROADMAP (2026-2027)
• ChatGPT Plugin (GPT Store)
• Siri/Apple Intelligence integration
• Google Gemini extension
• Microsoft Copilot plugin

📊 SUCCESS METRICS
• Month 6: 500 active providers
• Month 12: 5,000 transactions
• Month 18: First AI assistant integration live
```

### Speaker Notes:
> "We have a live MVP today. Our roadmap: closed beta this quarter with 50 providers, public launch in Hyderabad by Q3, then Bangalore. We're targeting 500 active providers and 5,000 transactions by end of year one."

---

## SLIDE 11: Team
**Visual**: Team photos with backgrounds

### Content:
```
👥 TEAM

ROHAN KRISHNA ULLAS
Founder & CEO
• Software Engineer background
• Built voice & AI products
• Hyderabad native (local market knowledge)
📧 rohankrishnaullas@gmail.com
🔗 linkedin.com/in/rohan-krishna-ullas-80164317a

YASH YADAV
Co-Founder
• [Add background]
🔗 linkedin.com/in/yash-yadav-8464b61aa


💡 Why Us?
• Technical founders who built the MVP
• Deep understanding of India's gig economy
• Lived the problem firsthand
```

### Speaker Notes:
> "We're technical founders who've built the MVP ourselves. I'm based in Hyderabad, which gives us deep local market knowledge. We've lived this problem - trying to find specific help and seeing informal workers struggle to monetize their skills."

---

## SLIDE 12: The Ask
**Visual**: Clear funding ask + use of funds

### Content:
```
🙏 THE ASK

Seeking: ₹50L - ₹1Cr Pre-Seed

USE OF FUNDS:
┌────────────────────────────────────┐
│ 40%  Engineering (backend, mobile) │
│ 30%  GTM (supply acquisition)      │
│ 20%  Cloud/AI infra                │
│ 10%  Operations                    │
└────────────────────────────────────┘

WHAT WE NEED:
✓ Funding to build backend & launch
✓ Mentorship on marketplace dynamics
✓ Cloud/AI credits (Azure, OpenAI)
✓ Intro to pilot communities/campuses

📅 Timeline to launch: 6 months post-funding

Let's chat! 📧 rohankrishnaullas@gmail.com
```

### Speaker Notes:
> "We're raising ₹50 lakhs to ₹1 crore pre-seed to build out our backend, launch publicly, and prepare our API for AI assistant integrations. Beyond funding, we're looking for mentorship on marketplace dynamics and connections to AI platform programs like OpenAI's GPT Store and Apple's developer programs. We can launch the standalone app within 6 months, with first plugin integration by month 18."

---

## 📎 APPENDIX SLIDES (Optional)

### A1: Detailed Use Cases
```
REAL DEMAND SCENARIOS

🏍️ "Take my bike to service center 15km away, pick it up later, bring it back"
🐕 "Dog walker, morning 7am, Banjara Hills area"
👵 "Caregiver for grandmother, female, 50+, speaks Telugu"
📚 "Math tutor for Class 10, 2 weeks before exams"
🚗 "Someone to handle my car registration at RTO"
🎂 "Help organizing my kid's birthday party"
📦 "Pickup from airport and drop to Secunderabad"
```

### A2: Technical Architecture
```
TECH STACK

Frontend:       React 18, Azure Static Web Apps
AI/Voice:       Azure OpenAI (GPT), Azure Speech Services
Backend:        Node.js/Express (planned)
Database:       Azure Cosmos DB (planned)
Real-time:      Azure SignalR (planned)
Payments:       Razorpay (planned)
```

### A3: Competitive Deep-Dive
```
DETAILED COMPARISON

                 Hanaserve  UrbanClap  Swiggy Genie  TaskRabbit
Voice-first         ✅         ❌          ❌           ❌
Multi-skill         ✅         ❌          ❌           ✅
Long-tail services  ✅         ❌          Partial      ✅
India-focused       ✅         ✅          ✅           ❌
AI matching         ✅         ❌          ❌           ❌
Vernacular          ✅         ❌          ❌           ❌
```

---

## 🎨 DESIGN TIPS

### Color Scheme
- Primary: Clay Pink (#D4A5A5) - matches app
- Secondary: White (#FFFFFF)
- Accent: Deep purple or teal for contrast
- Text: Dark gray (#333333)

### Fonts
- Headlines: Bold sans-serif (Poppins, Inter)
- Body: Clean sans-serif

### Visual Style
- Rounded corners (matches app UI)
- Soft shadows
- Phone mockups for product screenshots
- Icons for quick comprehension
- Minimal text per slide

---

## 📝 PRESENTATION TIPS

### Timing (10-minute pitch)
- Slides 1-3 (Problem): 2 minutes
- Slides 4-6 (Solution + Demo): 3 minutes
- Slides 7-9 (Market + Model): 2 minutes
- Slides 10-12 (Traction + Ask): 3 minutes

### Key Messages to Emphasize
1. **NOT a super app** - we're the service LAYER that powers AI assistants
2. **Natural language-first architecture** - built to plug into ChatGPT, Siri, Gemini, Copilot
3. **Category-free = better for both sides** - more discovery, more earnings
4. **MVP is live TODAY** - not a concept, a working product
5. **Timing is right** - AI assistants are becoming the new interface; we power the services behind them

### Questions to Prepare For
- "How do you solve the chicken-and-egg problem?"
- "What's your supply acquisition strategy?"
- "How do you ensure trust/safety?"
- "Why won't UrbanClap just copy this?"
- "What's your path to vernacular languages?"
- "How will you integrate with ChatGPT/Siri/Gemini?"
- "Why would Apple/Google/OpenAI partner with you?"
- "What's the business model when you're a plugin vs standalone app?"

---

*Last Updated: January 12, 2026*
