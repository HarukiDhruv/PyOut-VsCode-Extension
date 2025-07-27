#  PyOut – VS Code Extension for Inline Python Output

[![Visual Studio Marketplace](https://img.shields.io/badge/VSCode-PyOut-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/)  
[![MIT License](https://img.shields.io/github/license/HarukiDhruv/PyOut-VsCode-Extension)](LICENSE)  
[![Open Source](https://img.shields.io/badge/Open%20Source-Contribution%20Welcome-brightgreen)](https://github.com/HarukiDhruv/PyOut-VsCode-Extension/issues)

>  Execute Python code and view output **inline next to the line** – just like magic.  
> ✨Designed for productivity, learning, and fun — all in one extension!

---

## 🎥 Demo

Watch the full demo [here](./assets/demo.mp4) or [download it](./assests/demo.mp4).

![Click to play](https://img.shields.io/badge/Watch-Demo-blue?logo=playstation)


---

##  Key Features

| Feature                   | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
|  **Inline Output**        | Displays Python output beside the executed line using code lens or overlay  |
|  **Gemini Integration**   | Get AI-powered summaries and explanations *(optional)*                      |
|  **Easter Egg Trigger**   | Type fun keywords to launch browser-based games                             |             
|  **Customizable UI**      | Future updates will allow output box styling and themes                     |

---

##  How It Works

```ts
// 1. Listen to Python execution
vscode.workspace.onDidSaveTextDocument((document) => {
  if (document.languageId === 'python') {
    runPythonCode(document); // Executes and processes output
  }
});

// 2. Show inline result
function showInlineOutput(line: number, output: string) {
  const decoration = createInlineTextDecoration(output);
  editor.setDecorations(decorationType, [decoration]);
}
```

## Clone the repo
```git clone https://github.com/HarukiDhruv/PyOut-VsCode-Extension.git ```

# Install dependencies
```cd PyOut-VsCode-Extension
 npm install
```

# Open Source Contribution
This project is proudly part of the VS Code Open Source Ecosystem 
We built it while learning the internals of the VS Code extension API, TypeScript, and how to extend developer tooling.

## Built by:
Dhruba Hazarika & Ujwal Thakur 

## Contributions are welcome!

# Fork & clone
git clone https://github.com/HarukiDhruv/PyOut-VsCode-Extension.git

# Create feature branch
git checkout -b feat/your-feature

# Make your changes and commit
git commit -m "Add: Your awesome feature"

# Push and open a PR
git push origin feat/your-feature

# Let's build the future of developer experience — together.

Let me know if you'd like to add:
- GIFs or demo videos hosted elsewhere
- Contribution guidelines (CONTRIBUTING.md)
- Badges for NPM if you publish
- “Roadmap” section for features

Would you also like to auto-generate a `CONTRIBUTING.md` or `LICENSE` file?

---

## Hope We are doing some Good Stuff

Thanks for checking out **PyOut** — your support means a lot.

Do Visit:  [@HarukiDhruv](https://github.com/HarukiDhruv) 

Happy Coding! 


