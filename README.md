# Wahala

**A silent way to report violence, threats and abuse in Nigeria — and to see help actually coming.**

Built for the Andela × Open Society Foundations invention sprint, track 3:
*Safety, Reporting & Protection*.

**Live:** https://wahala-beta.vercel.app · **Judges can skip the unlock:**
[/?open=1](https://wahala-beta.vercel.app/?open=1) · **Response desk:**
[/responder](https://wahala-beta.vercel.app/responder)

> **This is a prototype built for judging. It does not dispatch real help.**
> In a real emergency in Nigeria, call **112**.

---

## The problem

Two people need to report danger, and they need opposite things.

Someone taken off a road in Zamfara has a phone in their pocket, one bar of
signal, and seconds. They need the alert to be *fast* and to *reach someone*.

Someone being beaten at home has all the time in the world and none of the
safety. A buzz on the lockscreen while he is holding her phone is not a
notification — it is the thing that gets her hurt. She needs the alert to be
*invisible*.

Most panic-button apps are built for the first person. They are loud, they are
proud of their icon, and they light up your screen to tell you help is coming.
For the second person that behaviour is the danger.

Wahala is built for both, and it treats silence as the default.

---

## What it does

**One app, two speeds.**

| | Immediate danger | Considered report |
|---|---|---|
| Input | One tap. No typing. | What happened, who is involved, when |
| GPS | Starts on screen open, sent with the tap | Optional — can be withheld |
| For | Attack in progress, kidnapping | Abuse you are reporting, not fleeing |

**It is quiet on purpose.** No push notifications, no sound, no vibration, no
badge. Not even when the agency replies. The status page updates itself and the
reply is simply *there* when the person next looks. This is the core design
commitment, and everything else follows from it.

**It wears a disguise.** The app opens as a working calculator. The tab title,
the install name and the icon all say "Calculator". Typing `112` and pressing
`=` opens the real thing. Anyone scrolling the phone's recent-apps list sees
arithmetic.

**Quick exit.** One tap wipes the outbox, clears storage and replaces the page —
back button included — with an ordinary news site.

**It speaks five languages.** English, Nigerian Pidgin, Yorùbá, Igbo and Hausa —
every reporter-facing string, including the agency's reply.

**You can tell a real responder from a fake one.** A reply saying help is
coming is also a way to manipulate someone — *"we got your report, come
outside"* is a luring technique, and in an abuse case the likeliest sender is
the person being reported, who has the phone and can read the reference code
off the screen. So the reporter gets a four-digit **callback code** when they
file. A genuine responder has to quote it back, or their reply arrives visibly
unverified. Four digits, because the check happens at a door or on a phone
call — not in the app. The code is never returned over the reporter's polling
endpoint, so reading their screen does not reveal it.

**It tells you what to do while you wait.** Three concrete steps, chosen by
incident, available offline in all five languages. During a kidnapping:
conserve battery, keep the phone hidden, do not fight to keep it — the report
has already gone. After a sexual assault: you can get medical care without
making a police report first.

**It can reach your own people, not just an agency.** In much of Nigeria a
neighbour arrives before a unit does, so trusted contacts are a first-class
destination: one SMS to all of them at once, carrying a map link a
non-technical relative can open. The list never leaves the phone — a server
holding the names and numbers of the people someone trusts would be exactly the
map an abuser or a trafficker would want — and quick exit erases it.

**It still fires if the phone is taken.** For a kidnapping there is a
dead-man's switch: send in ten minutes unless I cancel. Arming registers the
report with the server immediately, so firing is a deadline the server
evaluates rather than a timer on a device that may be smashed or flat by then.
Cancelling after the deadline is refused rather than quietly accepted, because
responders may already be moving.

**It closes the loop.** A responder acknowledges with an ETA: *"We have your
location. A unit is on the way. ~25 minutes."* That reply renders in the
reporter's own language, silently. If nobody arrives by the ETA, the screen
tells them to call 112 and quote their reference code.

---

## The part that took the most thought: getting a report out on a bad network

GPS does not need the internet. The chip talks to satellites, so coordinates are
available with the data connection completely dead. Only *transmission* has to
wait. That asymmetry is what the whole transport design is built on.

Three tiers, tried in order:

| Tier | Condition | What happens |
|---|---|---|
| 1 | Data available | Straight to the response desk |
| 2 | GSM signal, no data | One tap opens a prefilled SMS to 112 |
| 3 | No signal at all | Held in IndexedDB, flushed the moment a bar returns |

For tier 2 the entire report is encoded into a single SMS:

```
HLP1|s|ha|ci|11.99000,8.53000|m|1t8k3f|HAUSA1
```

Forty-three characters. Positional and abbreviated, because on a network that
may only manage one message, the difference between 140 characters and 200 is
the difference between arriving and not.

**An honest limit:** a web app cannot send an SMS silently in the background.
Android and iOS do not grant that to browsers. So tier 2 opens the messaging app
with the message already written and the person presses send. Anyone
demonstrating otherwise is faking it.

---

## Pathways, not "the authorities"

The track asks for a *clear pathway to timely support*, so a report routes to a
named body with a known remit rather than a vague agency.

| Incident | Routed to |
|---|---|
| Sexual abuse | Mirabel Centre → WARIF → Lagos DSVA → 112 |
| Kidnapping | 112 → NSCDC → NAPTIP |
| Physical violence | 112 → Lagos DSVA → NSCDC |
| Being followed | 112 → Lagos DSVA |

The destination is shown **before** sending, not after. That is the difference
between shouting into the void and a pathway the person can see.

**Only 112 carries a phone number in this prototype.** Every other hotline is
deliberately left blank and labelled *"not verified"*. Publishing a digit I
could not confirm, in an app someone opens during an assault, is the one failure
mode that costs a person something real. Those numbers need collecting from each
organisation directly before this goes near a user.

---

## What is real and what is simulated

Being straight about this, because a demo that blurs the line is not worth
trusting.

| | Status |
|---|---|
| Report capture, GPS, encoding, offline queue | **Real** |
| Offline shell — verified on the deployment | **Real** |
| Callback-code verification | **Real** |
| Trusted contacts, device-only | **Real** |
| Dead-man's switch | **Real** |
| Five-language interface | **Real** |
| Calculator disguise, quick exit, silent updates | **Real** |
| Referral routing logic | **Real** |
| The response desk | **Simulated** — built, labelled, in this repo |
| Dispatch to NPF / NEMA / NSCDC | **Not connected.** No public API exists |
| Hotline numbers other than 112 | **Unverified**, shown as such |
| Translations | **AI-drafted**, pending native-speaker review |

---

## Running it

```bash
npm install
npm run dev
```

Open **http://localhost:3100**. You need two windows to see the point:

1. **http://localhost:3100** — type `112`, press `=`. File a report.
2. **http://localhost:3100/responder** — it appears within 4 seconds.
   Acknowledge it with an ETA.
3. Back in window 1 — the reply arrives silently, in the reporter's language.

Judges can skip the unlock with `/?open=1`.

### Configuration

`NEXT_PUBLIC_SMS_SHORTCODE` sets where the offline SMS fallback is addressed.
Unset, it is **112** — Nigeria's real emergency line, which is correct for a
real deployment and wrong for anything people will tap to try out. Point it at
a phone you own before demoing. The interface shows which number it is
addressing, so nobody sends blind.

See `.env.example` for the full list.

### Storage

In-memory by default, which is fine for one local process and wrong for any
serverless deployment: a report filed on one instance is invisible to the
response desk running on another, so the loop silently breaks in the one place
a judge would click.

Two remote backends, picked by whichever credentials are present. `REDIS_URL`
for anything speaking the Redis protocol — this is what Vercel's marketplace
provisions, and what the live deployment runs on. Or `UPSTASH_REDIS_REST_URL`
and `UPSTASH_REDIS_REST_TOKEN` for Upstash over HTTP, which suits serverless
better where it is available.

---

## Architecture

```
src/
  app/
    page.tsx              calculator disguise — the default entry
    report/               triage → immediate | detailed
    status/[ref]/         the silent thread, polled every 5s
    responder/            simulated agency desk
    api/reports/          create, list, fetch, reply
  lib/
    i18n.ts               71 keys × 5 languages, with interpolation
    report.ts             model + the 160-character SMS codec
    transport.ts          the three-tier ladder
    queue.ts              IndexedDB outbox
    geo.ts                GPS capture with a hard timeout
    referrals.ts          incident → named Nigerian body
    store.ts              in-memory / Upstash adapter
  components/
```

Next.js 16 (App Router), TypeScript, Tailwind v4. No UI framework, no state
library — the app is small and the dependencies are a liability, not an asset,
in something meant to load on 2G.

### Two decisions worth explaining

**Dark is a safety property, not a style.** A lit screen in a dark room is a
tell. The palette emits as little light as possible while staying above WCAG AA.

**Replies travel as translation keys, not prose.** The desk works in English;
the person in danger may not. Rendering happens on their device, in their
language. A responder who types freehand gets a warning, and the reply arrives
labelled as English — better than silently shipping something unreadable.

---

## Taking it to another country

Most of this is not Nigeria-shaped. A partner who can see your phone is
universal; one bar of signal and no data is the norm across much of the
continent rather than a local quirk; and a web app needs no app store's
approval anywhere, which matters when the install itself has to be
unremarkable.

Concretely, what a new country needs:

| | |
|---|---|
| Referral bodies | Data. `src/lib/referrals.ts` is a list plus an incident routing table. |
| Languages | Data. A dictionary in `src/lib/i18n.ts`; the interface reads keys, never literals. |
| Emergency number | **Partly hardcoded.** `NEXT_PUBLIC_SMS_SHORTCODE` sets the SMS target, but `112` is still written into roughly twenty translated sentences and is the calculator unlock. It should be an interpolated value like `{ref}` already is. |
| Everything else | Unchanged. The transport ladder, the disguise, the callback code and the dead-man's switch assume nothing about where they are running. |

So the honest position is that two of the three country-specific things are
already configuration, and the third is a known, small piece of work rather
than an architectural problem.

---

## Known gaps

Named rather than hidden, because they are the roadmap:

- **USSD for feature phones.** The people furthest from help are also furthest
  from a smartphone. This is the one substantial build still outstanding.
- **Accessibility.** Touch targets and contrast were designed for, but no
  screen-reader pass has been done.
- **The desk is not authenticated.** It stands in for an agency system, so in
  this prototype anyone who opens it can reveal a callback code. Real
  deployment needs the desk behind a login before the verification means
  anything against a determined attacker.

---

## Credits and honesty

Built by **Ugochukwu Odunukwe** for the Andela × OSF invention sprint.

The concept, the problem framing and the product decisions are mine. The code
was written with **Claude Code** as a pair, which the hackathon explicitly
invites; commit history shows the collaboration rather than hiding it.
Translations were AI-drafted and are marked in-source as needing a native
speaker before real use.
