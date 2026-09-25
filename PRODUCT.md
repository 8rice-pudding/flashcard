# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/JavaScript using browser-local storage; no backend or framework.

## Users

Primary users are individual learners who review vocabulary on a personal device. The core workflow is short, repeated study sessions with a lightweight cycle of seeing a word, recalling meaning, and scheduling review based on performance.

## Product Purpose

This product helps a user memorize English vocabulary and image-associated terms through a card-based review flow. It emphasizes fast repetition, local persistence, and low-friction daily study.

## Positioning

The product competes on simplicity and repeatability rather than a large content library or social features. Its key differentiator is local-first review with spaced repetition logic in a single-page browser app.

## Operating Context

The app is used in a browser, typically on a laptop or tablet, and stores all data in `localStorage`. Users may add words manually, add image cards, and review due items without any remote service.

## Capabilities and Constraints

- Add plain vocabulary entries with English, Chinese, example sentence, and optional image
- Support image card entries stored as base64 in `localStorage`
- Track review scheduling with Leitner-style box progression
- Review only due items by default, with a separate review-all mode
- Use browser speech synthesis for pronunciation when available
- Keep all state client-side with no backend dependency
- Preserve compatibility with older localStorage record shapes

## Brand Commitments

No formal brand identity is present beyond a clean, modern education UI. The current interface uses a calm blue palette and simple card interactions.

## Evidence on Hand

- `README.md`: project description states it is a web page for scrolling word review
- `index.html`: working implementation containing the full interaction, data model, and review logic

## Product Principles

- Keep study friction low and repeatability high
- Prioritize local-first reliability over complexity
- Maintain a clear review loop with immediate feedback
- Support both text and visual vocabulary learning
- Preserve backward compatibility with older saved data

## Accessibility & Inclusion

The app includes a browser-native pronunciation feature and a single-language study flow. Native accessibility work is present but not yet fully audited for contrast, keyboard flow, and form clarity across all states.
