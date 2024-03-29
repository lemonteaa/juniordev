// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { read } from 'fs';
import * as vscode from 'vscode';


class CodingAgentViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "juniordev.codingAgentSidePanel";

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri
	) {}

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
		//throw new Error('Method not implemented.');
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebView(webviewView.webview);

	}

	private _getHtmlForWebView(webview : vscode.Webview) {
		return `
		<html lang="en">
		  <head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>MyExtension</title>
			<style>
			  textarea {
				width: 100%;
				height: 100%;
			  }
			</style>
		  </head>
		  <body>
			<input id="input" type="text">
			<button onclick="handleClick()">Click me!</button>
			<div id="output"></div>
			<script>
			  function handleClick() {
				const input = document.querySelector('#input');
				const output = document.querySelector('#output');
				const text = input.value;
				output.innerText = "You clicked a button!" + text;
			  }
			</script>
		  </body>
		</html>
		`;
	}
	
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const provider = new CodingAgentViewProvider(context.extensionUri);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "juniordev" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('juniordev.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from juniordev!');
		vscode.window.showInformationMessage('Folder: ' +
			vscode.workspace.workspaceFolders?.[0].name)
		//vscode.window.showInformationMessage('BaseURL: ')
		console.log(vscode.workspace.getConfiguration('juniordev').get('conf.provider.openai.baseUrl'));
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CodingAgentViewProvider.viewType, provider)
	)
}

// This method is called when your extension is deactivated
export function deactivate() {}
