import { IVSCodeExtLogger } from "@vscode-logging/logger";
import * as vscode from 'vscode';

export class LLMProvider {
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
		
		this._logger.info(JSON.stringify(reqBody));
		
		const result = await fetch(apiUrl, opt);
		const j: any = await result.json();
		this._logger.info(JSON.stringify(j));
		return j.choices[0].message.content;
	}
}
