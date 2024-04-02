import * as vscode from 'vscode';

export namespace codeagent {
    interface tree_data {
        label: string,
        children: tree_data[]
    }
    function build_tree(mytree : tree_data) : tree_item {
        let main_node = new tree_item(mytree.label, vscode.TreeItemCollapsibleState.Expanded);
        let child_nodes = [];
        for (const c of mytree.children) {
            let c_node = build_tree(c);
            c_node.parent = main_node;
            child_nodes.push(c_node)
        }
        main_node.children = child_nodes;
        return main_node;
    }

    class tree_item extends vscode.TreeItem
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
        root_tree_data : tree_data = {
            label: "Main",
            children: [
                {
                    label: "Theme Design",
                    children: []
                },
                {
                    label: "Design Site map",
                    children: [
                        {
                            label: "Implement React Routes",
                            children: []
                        },
                        {
                            label: "Page layout impl loop",
                            children: []
                        },
                        {
                            label: "Design API",
                            children: [
                                {
                                    label: "Generate Dataset",
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        root_tree = build_tree(this.root_tree_data);

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