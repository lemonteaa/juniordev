// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { read } from 'fs';
import * as vscode from 'vscode';

import { IVSCodeExtLogger, getExtensionLogger } from '@vscode-logging/logger';
import { codeagent } from './treeview';

async function showQuickPick() {
	let i = 0;
	const result = await vscode.window.showQuickPick(["Parcel", "create-react-app", "others..."], {
		placeHolder: 'unknown',
		onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`),
		title: 'Choose your Tech stack'
	});
	vscode.window.showInformationMessage(`Selected: ${result}`);
	return result;
}

class LLMProvider {
	//private _baseurl: string, private _accessToken: string, 
	constructor(private readonly _logger: IVSCodeExtLogger) {}

	async chatcompletion(my_messages: any, modelid : string) {
		const apiUrl = vscode.workspace.getConfiguration('juniordev').get('conf.provider.openai.baseUrl') + "/v1/chat/completions";
		const reqBody = {
			model: modelid,
			messages: my_messages,
			max_tokens: 4000,
			stream: false
		}
		const opt = {
			method: 'POST',
			headers: {Authorization: 'Bearer ' + vscode.workspace.getConfiguration('juniordev').get('conf.provider.accessToken'), 'Content-Type': 'application/json'},
			body: JSON.stringify(reqBody)
		}
		/*fetch(apiUrl, opt)
		  .then(response => response.json())
		  .then(response => { 
			this._logger.info(JSON.stringify(response));
			})
		  .catch(err => console.error(err))*/
		const result = await fetch(apiUrl, opt);
		const j: any = await result.json();
		this._logger.info(JSON.stringify(j));
		return j.choices[0].message.content;
	}
}

class CodingAgentViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = "juniordev.codingAgentSidePanel";

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _logger : IVSCodeExtLogger
	) {}

	my_updateWebviewView() {
		if (this._view) {
			this._view.webview.html = this._getHtmlForWebView(this._view?.webview);
		}
	}

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

		const sys_prompt = 
`You are a senior frontend engineer. Our project is setup with these tech stack:
- React app scaffolded with \`create-react-app\`
- Material UI chosen as the component UI library, installed with react integration using this command:
\`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material\`
  - Notice that \`emotion\` is chosen as the styling engine/CSS-in-JS solution.
  - Material Icons font is installed, so you can start using the \`Icon\` component right away.
- \`axios\` is installed so that calling backend API is easier
- Directory: \`src/pages\` for the pages, \`src/components\` for sub-page level components.

Your task is to fulfill user's request by implementing their requirement in the context of the project setup above. Show your code.`;

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'logData':
					console.log(data.value);
					this._logger.info(JSON.stringify(data.value));
					break;
				case 'startAgent':
					vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`Pasted: ${data.value}`))
					//vscode.window.activeTerminal?.sendText('python3 -m venv venv; source venv/bin/activate', true);
					const llm = new LLMProvider(this._logger);
					llm.chatcompletion([{
						role: 'system',
						content: sys_prompt
					}, {
						role: 'user',
						content: `Design and implement this: ${data.value}. Let's think step by step:
- Begin with the overall page layout. Assume that we've decomposed into our custom UI components already, and use those components in your layout.
- Then, implement the custom UI components you've identified in the previous step.
- As we're in prototype phase, assume we're using a mock backend API (you're free to chose the req/res schema and endpoint URL).

Show all of your codes.`
					}], 'mistral-7b-instruct').then(s => {
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(s));
					});
					break;
				default:
					vscode.window.showInformationMessage('unknown')
			}
		})
	}

	private _getHtmlForWebView(webview : vscode.Webview | undefined) {
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
			<p>Base URL: ${vscode.workspace.getConfiguration('juniordev').get('conf.provider.openai.baseUrl')}</p>
			<input id="input" type="text">
			<button onclick="handleClick()">Click me!</button>
			<button onClick="sendToExtension()">Send to Extension</button>
			<div id="output"></div>
			<script>
			  const vscode = acquireVsCodeApi();
			  const apiUrl = "${vscode.workspace.getConfiguration('juniordev').get('conf.provider.openai.baseUrl')}" + "/v1/chat/completions";
			  function handleClick() {
				const input = document.querySelector('#input');
				const output = document.querySelector('#output');
				const text = input.value;
				output.innerText = "You clicked a button!" + text;

				const reqBody = {
					model: 'mistral-7b-instruct',
					messages: [{
						role: 'system',
						content: 'You are a senior software engineer. You are passionate about technology and are willing to help the user, who is your colleague.'
					},
					{
						role: 'user',
						content: text
					}],
					max_tokens: 2048,
					stream: false
				}
				const opt = {
					method: 'POST',
					headers: {Authorization: 'Bearer ' + '${vscode.workspace.getConfiguration('juniordev').get('conf.provider.accessToken')}', 'Content-Type': 'application/json'},
					body: JSON.stringify(reqBody)
				}
				fetch(apiUrl, opt)
				  .then(response => response.json())
				  .then(response => { 
					vscode.postMessage({ type: 'logData', value: response });
					output.innerText = response.choices[0].message.content; })
				  .catch(err => console.error(err))
			  }

			  function sendToExtension() {
				const input = document.querySelector('#input');

				vscode.postMessage({ type: 'startAgent', value: input.value })
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

	const extLogger = getExtensionLogger({
		extName: "JuniorDev",
		level: "info",
		logPath: context.logPath,
		logConsole: true
	});
	extLogger.info("Hey man there - this is the beginning.");
	const provider = new CodingAgentViewProvider(context.extensionUri, extLogger);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "juniordev" is now active!');

	let tree = new codeagent.tree_view();
	vscode.window.registerTreeDataProvider('juniordev.codingAgentMainControl', tree);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('juniordev.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from juniordev!');
		vscode.window.showInformationMessage('Folder: ' +
			vscode.workspace.workspaceFolders?.[0].name)
		//vscode.window.showInformationMessage('BaseURL: ')
		console.log(vscode.workspace.getConfiguration('juniordev').get('conf.provider.openai.baseUrl'));
		provider.my_updateWebviewView();

		//const quickPick = vscode.window.createQuickPick()
		const r1 = await showQuickPick();
		console.log(r1);
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CodingAgentViewProvider.viewType, provider)
	)
}

// This method is called when your extension is deactivated
export function deactivate() {}
