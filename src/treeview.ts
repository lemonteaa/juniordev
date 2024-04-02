import * as vscode from 'vscode';

import { root_tree_data } from './chains/testchain/main';
import { build_tree } from './chains/datastruct';

export namespace codeagent {
    

    export class tree_item extends vscode.TreeItem
    {
        public children: tree_item[] | undefined;
        public parent: tree_item | undefined;

        constructor(
            public readonly label : string | vscode.TreeItemLabel, 
            public readonly collapsibleState?: vscode.TreeItemCollapsibleState | undefined,
        )
        {
            super(label, collapsibleState);
        }

        tooltip = "tooltip test";
    }

    export class tree_view implements vscode.TreeDataProvider<tree_item>
    {

        root_tree = build_tree(root_tree_data);

        onDidChangeTreeData?: vscode.Event<void | tree_item | tree_item[] | null | undefined> | undefined;
        getTreeItem(element: tree_item): vscode.TreeItem | Thenable<vscode.TreeItem> {
            return element;
        }
        getChildren(element?: tree_item | undefined): vscode.ProviderResult<tree_item[]> {
            if (element === undefined) {
                return [this.root_tree];
            } else {
                return element.children;
            }
        }
        getParent?(element: tree_item): vscode.ProviderResult<tree_item> {
            return element.parent;
        }
        resolveTreeItem?(item: vscode.TreeItem, element: tree_item, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
            throw new Error('Method not implemented.');
        }
        
    }
}