# Tragedy Looper

[Tragedy Looper (惨劇 RoopeR)](https://boardgamegeek.com/boardgame/148319/tragedy-looper)
is a scenario-based deduction board game where players take the roles of time loopers attempting to prevent a tragedy.

Its fun. :)

## So What's this?

This is the code for the website <https://tragedy-looper.github.io/>.

It is a tool that generates script specific deduction matrix for the specific
characters and a checklist for the Mastermind.

It contains all both Z-Man and WizKids' published scripts, as well as many fan-made scripts. You can also easily make and submit your own.

Scripts are saved locally (unless you submit them), and can easily be shared with others.

## Board Game Geek

There is also a thread on [Board Game Geek](https://boardgamegeek.com/thread/3066363/website-generate-script-specific-mastermind-and-pl) where you can discuss, (or report bugs if you don't want to create a github account).

## How to add new content?

This depends what you want to add.

### A new Script

You can go to the website and hit the button to create a new script (under choose script). Create a Script and it'll be saved in your browser's local storage (so if you switch browsers or clear your data, you won't have access to it, so be careful).

You can also write the script as text in JSON format (see below).

### Everything else

**Prerequirys:**

- npm
- editor that supports JSON schema

Every data is stored a JSON files, and can be extended by just adding more files or extend the existing. Every Type of data resides in its own file. (`characters.json`, `incidents.json`, `plots.json`, `roles.json`, `scripts.json`, `tragedys.json`) And for every type there exists a JSON schema to validate it and enable auto completion.  The JSON schema files will be created when `npm i` is called or `npm run generate-schema`.

When creating new tragedy sets or scripts, you should be aware that those depend on the others.
If you add a new incident in an `inident.json` it will only be recognized in the tragedy set after regenerationg the schemas agin (with the above commands) and change to the dev schema at the top of the file.

You can also use the github editor (hitting <kbd>.</kbd>) to have the expirience of autocomplete and validation. However in that case,
you can't use new roles or incidents, since the schemas will not be updated.

## What's Next?

- [x] Fix Character Metadata: start positions and Forbidden Locations are Wrong for almost everyone
- [x] Generated Character Cards: The
  [official Website](http://bakafire.main.jp/rooper/sr_dl_04_sozai.htm) has
  blank Cards and the Character images. With this we could generate images for
  cards that contains localization (if available) and use Custom Characters.
  - Cards will get generated, but needs to be reviewed, especially wording, since a card has only limited space.
- [ ] Validate Data: Not all Rules are enforced, e.g. A Person can be the
  Culprit of many incidents (not only for serial murder). Or a Script may have
  the wrong roles. This would brake some Another Horizon Scripts (which is a good
  thing I guess)
- [ ] Persist Player Aid Choices, so an accidental reload will not delete every thing…
- [ ] Better Localization, with placeholders, so there would be less text overall and it is the same for the same actions.

Not sure when or if I will do anything of this, It is good enough for now I guess.
