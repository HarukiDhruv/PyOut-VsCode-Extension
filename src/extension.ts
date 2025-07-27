import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyCUxck-lw6eG6h2Lt1jDRf2gXOJKbEgua4';

const themes = {
    'Cyber Glow': { color: '#00f7ff' },
    'Sunset Drive': { color: '#ff8a5c' },
    'Forest Spirit': { color: '#a3ffb3' },
    'Synthwave': { color: '#f721d4' },
    'Quantum': { color: '#7d5cff' },
    'Stardust': { color: '#e6deff' }
};
type ThemeName = keyof typeof themes;

async function callGeminiAPI(code: string): Promise<string> {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Explain this Python code to a beginner in simple language: \n\n\`\`\`python\n${code}\n\`\`\``;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return `Error: API request failed with status ${response.status}. ${errorBody}`;
        }

        const data: any = await response.json();
        return data.candidates?.[0]?.content.parts[0].text || 'No explanation found.';
    } catch (error) {
        console.error(error);
        return 'Error: Failed to connect to the Gemini API.';
    }
}

let currentDecorationType: vscode.TextEditorDecorationType | undefined;
let timeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('PyOut is now active!');

    const themeCommand = vscode.commands.registerCommand('pyout.selectTheme', async () => {
        const themeNames = Object.keys(themes) as ThemeName[];
        const selectedTheme = await vscode.window.showQuickPick(themeNames, {
            placeHolder: 'Select a color theme for the PyOut output'
        });
        if (selectedTheme) {
            await vscode.workspace.getConfiguration('pyout').update('theme', selectedTheme, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`PyOut theme set to: ${selectedTheme}`);
        }
    });

    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateOutput(editor);
        }
    });

    const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
        updateOutput(event.textEditor);
    });

    context.subscriptions.push(themeCommand, textChangeDisposable, selectionChangeDisposable);
}

function updateOutput(editor: vscode.TextEditor) {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const selection = editor.selection;
        let textToProcess: string;

        if (!selection.isEmpty) {
            textToProcess = editor.document.getText(selection).trim();
        } else {
            textToProcess = editor.document.lineAt(selection.active.line).text.trim();
        }

        if (textToProcess.endsWith('# explain')) {
            const codeToExplain = textToProcess.replace(/# explain$/, '').trim();
            if (codeToExplain) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "PyOut: Explaining code...",
                    cancellable: false
                }, async () => {
                    const explanation = await callGeminiAPI(codeToExplain);
                    vscode.window.showInformationMessage(explanation);
                });
            }
            clearOutput(editor);
        } else if (textToProcess.includes('# take-a-break')) {
            vscode.env.openExternal(vscode.Uri.parse("https://dinosaurgame.app/world"));
            clearOutput(editor);
        } else {
            const currentLineText = editor.document.lineAt(selection.active.line).text.trim();
            const shouldExecute = (currentLineText.startsWith('print(') || /\w+\s*\(.*\)/.test(currentLineText)) &&
                !currentLineText.startsWith('def ') && !currentLineText.startsWith('class ') &&
                !currentLineText.startsWith('for ') && !currentLineText.startsWith('while ') &&
                !currentLineText.startsWith('if ') && !currentLineText.startsWith('elif ') &&
                !currentLineText.startsWith('else:') && !currentLineText.startsWith('@');

            if (shouldExecute) {
                const documentText = editor.document.getText();
                runPythonCode(documentText, editor, selection.active.line);
            } else {
                clearOutput(editor);
            }
        }
    }, 500);
}

function runPythonCode(code: string, editor: vscode.TextEditor, currentLine: number) {
    const lines = code.split('\n');
    const codeToExecute = lines.slice(0, currentLine + 1).join('\n');
    const tempFilePath = path.join(__dirname, 'temp_pyout.py');
    fs.writeFileSync(tempFilePath, codeToExecute);
    const startTime = process.hrtime();

    exec(`python "${tempFilePath}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        const endTime = process.hrtime(startTime);
        const executionTimeMs = Math.round(endTime[0] * 1000 + endTime[1] / 1e6);

        try {
            if (error || stderr) {
                if (error && error.killed) {
                    displayInlineOutput('Execution timed out', editor, currentLine, executionTimeMs, true);
                    return;
                }
                const rawMessage = stderr || (error ? error.message : 'Execution error');
                const errorMessage = rawMessage.split('\n').filter(line => line.trim() !== '').pop() || 'Execution error';
                displayInlineOutput(errorMessage, editor, currentLine, executionTimeMs, true);
            } else {
                const lastOutput = stdout.trim().split('\n').pop() || '';
                displayInlineOutput(lastOutput, editor, currentLine, executionTimeMs);
            }
        } finally {
            fs.unlinkSync(tempFilePath);
        }
    });
}

function displayInlineOutput(output: string, editor: vscode.TextEditor, line: number, executionTime: number, isError: boolean = false) {
    clearOutput(editor);
    if (!output.trim()) { return; }

    const configuration = vscode.workspace.getConfiguration('pyout');
    const defaultTheme: ThemeName = 'Stardust';
    const selectedThemeName = configuration.get<ThemeName>('theme', defaultTheme);
    const outputColor = isError ? themes['Synthwave'].color : (themes[selectedThemeName]?.color || themes[defaultTheme].color);

    const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(line, 1024, line, 1024),
        renderOptions: {
            after: {
                contentText: `  # ${output.trim()} (${executionTime}ms)`,
                color: outputColor,
                fontStyle: 'italic',
                margin: '0 0 0 1rem',
            }
        }
    };

    currentDecorationType = vscode.window.createTextEditorDecorationType({});
    editor.setDecorations(currentDecorationType, [decoration]);
}

function clearOutput(editor: vscode.TextEditor) {
    if (currentDecorationType) {
        currentDecorationType.dispose();
        currentDecorationType = undefined;
    }
}

export function deactivate() {
    console.log('PyOut is now deactivated.');
}