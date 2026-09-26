# CallFloor

Outbound call-center trainer for the **Kitchen & Wine** German survey (Umfrage).

Pick a lead, type their number, call. The customer answers in German. Work the script in order, tick each line, capture the answers.

## What it is

- 15 German households with different reactions (complete, DNC, hang-up, mailbox, wrong number, no time, hard of hearing, skeptical, no wine)
- Cold-call script in German, 11 lines in order
- Softphone + live transcript
- Customer voice (TTS) and optional mic matching for your lines

## Script order

1. Greeting / sorry for the interruption
2. Four questions, twenty seconds
3. Kitchen (classic / upscale)
4. Food (meat / fish / vegetarian)
5. Wine colour (red / white / rosé)
6. 2–3 times per year?
7. Light vs heavy wines
8. Last name, spell it
9. First name, spell it
10. Thank-you call
11. Close

## Run locally

```bash
npm install
npm run dev
```

Open the app, **Open the floor**, pick a lead, type the number (or Use number), **Call**.

Put your name in **Agent** so the greeting includes *Mein Name ist …*.

## Stack

React 19, TanStack Start, Tailwind v4, Zustand, xAI TTS for customer voice.

Fictional lead data only — not a real campaign.
