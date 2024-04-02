import * as vscode from 'vscode';

import { codeagent } from '../treeview';
import { LLMProvider } from '../llm/LLMProvider';

export interface tree_data {
    label: string,
    children: tree_data[],
    prompt?: LLMPromptTemplate,
    effect?: (response: object) => Promise<void>
}
export function build_tree(mytree : tree_data) : codeagent.tree_item {
    let main_node = new codeagent.tree_item(mytree.label, vscode.TreeItemCollapsibleState.Expanded);
    let child_nodes = [];
    for (const c of mytree.children) {
        let c_node = build_tree(c);
        c_node.parent = main_node;
        child_nodes.push(c_node)
    }
    main_node.children = child_nodes;
    return main_node;
}

export interface LLMPrompt {
    messages: {
        role: "system" | "user" | "assistant",
        content: string
    }[]
}

export interface LLMPromptTemplate {
    //args: string[],
    handler: (inputs : object) => LLMPrompt,
    parser?: (i : string) => object
}

//const llm = new LLMProvider(this._logger)
export async function runChain(mytree: tree_data, inputs: object, llm: LLMProvider) {
    let child_args = {};
    if (mytree.prompt !== undefined) {
        const prompt = mytree.prompt.handler(inputs);
        const res = await llm.chatcompletion(prompt, 'mistral-7b-instruct');
        if (mytree.prompt.parser !== undefined) {
            child_args = mytree.prompt.parser(res);
        } else {
            child_args = { out: res };
        }
        // Effect
        if (mytree.effect !== undefined) {
            await mytree.effect(child_args);
        }
    }
    for (const c of mytree.children) {
        await runChain(c, child_args, llm)
    }
    
}
