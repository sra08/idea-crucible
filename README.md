<p align="center">
  <img src="assets/icon.png" width="96" alt="Idea Crucible logo" />
</p>

<h1 align="center">Idea Crucible</h1>

<p align="center">
  A personal anti procrastination app for chronic brainstormers. Stop hoarding ideas. Forge them or bury them.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-20232A?logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
</p>

---

## What it is

Idea Crucible is a high friction accountability app built for people who have a hundred ideas and finish none of them. You dump raw thoughts into a sandbox, but you can only ever have two ideas active at once. Each active idea is broken into tiny 15 minute micro tasks, the app nags you on your own schedule, and anything you ignore for two weeks is forced into a decision: do the work, let it go, or shelve it honestly.

It runs entirely on your phone. No account, no server, no tracking.

## Features

- **The Sandbox.** A pressure free dumping ground for raw ideas.
- **The Arena, two slots only.** A hard cap of two active projects. To start a new one you must finish or shelve an old one.
- **Micro tasks.** Every active idea is split into stupidly small first steps so momentum is easy to find. Generated offline by default, or by an AI model if you add a key.
- **The Nag-Bot.** Local reminders at the times you choose, in a tone you pick (gentle or blunt).
- **The 14 day clock.** Completing a micro task is the only thing that resets it. Opening the app does not count.
- **The decision portal.** At day 14 a stalled project locks and forces a choice: bury it, revive it by doing a task right now, or take a one time sabbatical.
- **Home screen widget.** Shows the project closest to the cemetery at a glance, and keeps counting even while the app is closed.

## How it works

The heart of the app is one rule, enforced in the engine: only completing a micro task resets the 14 day stagnation clock. When you finish a task, the app cancels the old reminders and schedules fresh ones from that moment.

- **Day 10** a nudge.
- **Day 13** a 24 hour warning.
- **Day 14** the project locks and the decision portal opens.

Because every reminder is something the phone can know in advance, the whole thing runs on local scheduled notifications with no backend.

## Screenshots

> Add a screenshot here once you have one, for example `docs/home.png`, then reference it like `![Home](docs/home.png)`.

## Tech stack

- [Expo](https://expo.dev/) and React Native
- TypeScript
- `expo-notifications` for local scheduled reminders
- `react-native-android-widget` for the native home screen widget
- `@react-native-async-storage/async-storage` for on device persistence
- `@expo/vector-icons` for icons
- Custom type: Archivo Black, Space Grotesk, Space Mono

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) LTS
- A free [Expo](https://expo.dev/) account
- An Android phone (the widget and reminders are native, so the app runs as a development or standalone build rather than in Expo Go)

### Install

```bash
npm install
npx expo install --fix
```

The `--fix` step aligns native dependency versions to your Expo SDK and prevents most first run errors.

### Run in development

```bash
npm start
```

This starts the dev server. Open the development build on your phone, on the same Wi-Fi as your computer, and your edits reload live.

### Build the Android app

Builds run in the cloud with EAS, so no local Android toolchain is required.

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android   # the workbench build
eas build --profile preview --platform android       # the standalone APK
```

Install the resulting APK from its build page. The `preview` build is fully standalone: it works offline with no dev server.

If EAS complains about git, you can skip version control with `EAS_NO_VCS=1` before the build command.

## Configuration

Micro task generation works offline out of the box. To use AI generated tasks instead, paste an Anthropic API key into `src/config.ts`. Note that a key placed there ships inside your build, which is fine for a private app but not for one you distribute.

## Project structure

```
src/
  types.ts            data model
  constants.ts        slot cap and the 10 / 13 / 14 timeline
  store.ts            persistence over AsyncStorage
  arena.ts            pure rules: slots, days since execution
  notifications.ts    local notification scheduling
  engine.ts           orchestration: promote, complete, bury, revive
  microsteps.ts       AI generation plus offline fallback
  widget*.ts(x)       the home screen widget
  index.ts            public API, initEngine, nag helpers
  ui/                 theme, components, screens, and flows
App.tsx               entry, font loading
index.js              registers the widget handler and root component
```

The `src/ui/theme.ts` file holds every color and font. Change it and the whole app restyles.

## Roadmap

- Revive a buried idea from the History screen
- A real execution streak and weekly graph
- iOS support, including an iOS widget
- A schedule picker with custom times

## License

MIT. See `LICENSE`. Use it, fork it, make it your own.

## Note

Built as a personal project to fight my own habit of collecting ideas and never shipping them. If it helps you do the same, good.
