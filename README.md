# Frank

![Logo du projet](images/logo_transparent.png)

The goal of this project, named **Frank**, is to build an application that allows users to create and display slide presentations similar to PowerPoint or Keynote, but where the content is defined using a Markdown and a CSS. The application is designed with features that are particularly useful for developers.

These features include:
- **Displaying code snippets** within slides, with automatic scrolling when the code is longer than the available space (or without scrolling if the code fits). The code can be written directly in the slide or loaded from separate files.
- **Executing commands** directly from a slide.

### File Architecture

We use a specific file extension called `.codeprez`, which contains the following architecture:
```
my-file.codeprez/ 
├── presentation.md
├── config.json
├── style.css
├── assets/
│ └── image files
└── env/
  ├── exe files
  └── code files 
```

### How to get Frank

To use Frank, you first need to clone the project from GitHub by running:
```bash
git clone https://github.com/LaNuggets/Frank.git
```
Once the repository has been cloned, install all the dependencies required by the project by running:
```bash
cd Frank
npm install
```
If any vulnerabilities are detected after installing the dependencies, run the following command to fix them:
```bash
npm audit fix --force
```
After completing these steps, you can finally start the program by running:
```bash
npm run tauri dev
```
if you want to do a build of the project you just need to do: 
```bash
npm run tauri build
```

### Key Features & Shortcuts

### Shortscuts
To improve workflow and better control the project, the following shortcuts are available:
- Switch between presentation and preview mode → `Alt + P`
- Switch to slide editing mode → `Alt + M`
- Edit author / title → `Alt + A`
- Edit slide style → `Alt + C`

File Management
- Save → `Ctrl + S` / `Cmd + S`
- Save as → `Ctrl + Shift + S` / `Cmd + Shift + S`
- Open project → `Ctrl + O` / `Cmd + O`
- Create new empty project → `Ctrl + N` / `Cmd + N`

Presentation Mode Navigation

When in presentation mode, you can navigate between slides in several ways:
- Use the **arrow keys**
- Click the **left mouse button** (right or left part of the screen)

You can also jump directly to a specific slide using the following shortcut:

- Press `Alt Gr`, then enter the **slide number**, then press `Enter`

Example:

`Alt Gr + 14 + Enter` → jumps directly to slide 14

If the project has fewer than 14 slides, it will go to the last available slide.

### Custom Markdown Features

This project extends standard Markdown with custom syntax.

**File Code Preview**

You can display specific lines from a file using:
```md
  [code](file_path#start-end)
```
Example:
```md
  [code](./assets/test.py#3-6)
```
This will display lines 3 to 6 from test.py.

**Auto-import local files (`?=` syntax)**

Prefixing a local file reference with `?=` allows automatic importing into the `./assets` folder.

Example:
```md
  ?=[code](c:\test.py#3-6)
```
This will:
- Copy the file into ./assets
- Then convert it into:
```md
  [code](./assets/test.py#3-6)
```
The same behavior applies to images:
```md
  ?=![cat](c:\cat.jpg)
```
Becomes:
```md
![cat](./assets/cat.jpg)
```
**Inline CSS Styling in Markdown**

You can apply inline styling directly inside Markdown using a custom syntax:
```md
  <key="value">text</>
```
Where key corresponds to a CSS property defined in the configuration file.

Example:
```md
<c="blue" p="50px" b="red">text</>
```
This creates a styled block:
- Text color: blue
- Padding: 50px
- Background color: red

**Markdown Configuration**

The mapping between shorthand keys and CSS properties is defined in:

`src/assets/markdown.config.json`

Example:
```json
{
    "c": "color",
    "b": "background",
    "ta": "text-align",
    "fs": "font-size",
    "p": "padding"
}
```
You can extend this system by adding new mappings:
```json
"fd": "flex-direction"
```
This allows usage like:
```md
<fd="center">text</>
```
(assuming the key exists in the configuration file)

### Collaborator
[Aurelien DUGAST](https://github.com/LaNuggets/) and [Cassian JOLY](https://github.com/Cassian-J)
