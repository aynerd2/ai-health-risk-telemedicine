# Contributing

Thanks for considering putting some time into this project.

## Before you start

For anything more than a small fix (a typo, a broken link, a one-line bug fix), open an issue first describing what you want to change and why. It saves everyone time — sometimes there's context on why something was built a certain way that isn't obvious from the code alone, and it's better to find that out before you've written the code than after.

## Setting up your dev environment

Follow the setup steps in the [README](README.md) to get both the backend and frontend running locally. If you hit a step that doesn't work as described, that's worth its own issue or PR — the setup instructions should always match reality.

## Making a change

1. Fork the repo and create a branch off `main` for your change.
2. Keep pull requests focused. A PR that fixes one bug or adds one feature is much easier to review than one that does five unrelated things.
3. Run the backend test suite before opening a PR:
   ```bash
   cd backend
   pytest
   ```
4. If you're changing anything in the API (new endpoints, changed request/response shapes), update the frontend's API client (`frontend/lib/api.ts`) to match, and mention the change in your PR description.
5. If you're touching the ML side of things (feature lists, preprocessing, model training), explain what you tested it against — a screenshot of a confusion matrix or a metrics printout is genuinely useful here, not just "it works."

## Code style

- **Backend:** standard Python conventions, type hints where they help readability, nothing exotic.
- **Frontend:** TypeScript, functional components, Tailwind for styling. Try to match the patterns already used in nearby files rather than introducing a new approach to the same problem.

## Reporting bugs

Include:
- What you did
- What you expected to happen
- What actually happened
- Whether it's the backend, frontend, or both

If it's a data/ML issue (a prediction that seems obviously wrong, a training script that errors on a particular dataset), include the dataset's column names and a sample row or two if you can share them.

## Questions

If something in the codebase doesn't make sense, open an issue and ask — there's a decent chance the answer will also improve the documentation for the next person.
