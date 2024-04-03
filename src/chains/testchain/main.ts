import * as vscode from 'vscode';
import { tree_data } from '../datastruct'

async function vsWriteFile(path: string, content: string) {
    const writeData = Buffer.from(content, 'utf8');
    const testBase = vscode.workspace.workspaceFolders?.[0].uri;
    if (testBase === undefined) {
        throw new Error("No workspace folder");
    } else {
        const fileUri = vscode.Uri.joinPath(testBase, './staging', path);
        await vscode.workspace.fs.writeFile(fileUri, writeData);
    }
}

const sitemap_sys = `You are a UX designer working in a software engineering team, who are working on a new project. The user will show a rough description of the requirement for the frontend in the conversation below. Your task is to design the overall sitemap based on user's description, but also think about it and come up with a design that make sense and is fleshed out, instead of blindly following the instruction.

You should decide on a set of pages that implement the website. You should also decide on a suitable React UI component name for each page, as well as the frontend URL relative to site root. Note that a page can be one whose URL has path and query parameter.

Your response should be a machine readable type in syntactically correct JSON. The schema of the JSON should be a list of Page object. A Page object is a JSON map with these attributes: name, desc, compName, url. desc is a text description explaining what the page is, compName is the React UI Component Name, url is the frontend URL. For url, denote any path param like this: /products/{productid}/details.

There should be no other outputs, such as markdown codeblock or other text that explain it. This is because the user is interacting indirectly with you, being mediated by a computer automation. As such any deviation from the formatting rules above will result in a transmission failure.`

const theme_sys = `You are a website UI designer, who is familiar also with programming and frontend frameworks such as React, and component UI libraries.`
const theme_turn1 = (desc: string) => { return `I am writing a Material UI website with React. The website's description: ${desc}. **Your task: Suggest a design statement, then give some concrete design element.** Note: Try to come up with a good design that stands out, is tailored to the specifics of the website, and avoid looks that are easily identificable as the Material UI through appropiate customization.`}
const theme_turn2 = `Based on the above, design a theme for the website and show me the code with the specific theme customization variable. Example code: \`const them = createTheme({ components: { MuiStat: { styleOverrides: { root:{ backgroundColor: '#121212' }, value: { color: '#fff' }, unit: { color: '#888' } } } } });\` Please use efficient coding style and give the most effect with smaller amount of code, such as focusing on the more visually important part first. Explain your choice with specific design elements such as palette, typography, spacing, etc.`

const coding_sys = `You are a senior frontend engineer. Our project is setup with these tech stack:
- React app scaffolded with \`create-react-app\`
- Material UI chosen as the component UI library, installed with react integration using this command:
\`npm install @mui/material @emotion/react @emotion/styled @mui/icons-material\`
  - Notice that \`emotion\` is chosen as the styling engine/CSS-in-JS solution.
  - Material Icons font is installed, so you can start using the \`Icon\` component right away.
- \`axios\` is installed so that calling backend API is easier
- Directory: \`src/pages\` for the pages, \`src/components\` for sub-page level components.

Your task is to fulfill user's request by implementing their requirement in the context of the project setup above. Show your code.

The user will be interacting indirectly with you, being mediated by a computer automation. Therefore, your response should be machine formated so that it is transmitted to the user successfully. In this case, the format used is FileList, as explained below:

Your response should be a strictly formated, machine readable markdown. Example:
File path: \`src/test/hello.js\`
File content:
\`\`\`js
console.log('hello');
\`\`\`
----
File path: \`src/public/index.html\`
File content:
\`\`\`html
<html>
  <head><title>Testing</title></head>
  <body>
    <p>Hey man</p>
  </body>
</html>
\`\`\`
----
Explanation: <you can add natural language explanation of your code above here>
`

const coding_template = (requirement: string, name: string, desc: string, compName: string, url: string) => { 
return `Overall system requirement: ${requirement}
Design and implement this page:
Name: ${name}
Description: ${desc}
Page Component UI name (React): ${compName}
This page's URL pattern: ${url}
Suggested implementation strategy:
1. First implement the overall page layout as a js file. You should assume that the major UI components in this page will be implemented as their own React UI component respectively and simply instantiate them. At this stage, please design their component name, as well as the props.
2. Then, for each React UI component you assumed in step 1 above, add a js file that implement that component.
Note:
As we're in prototype phase, assume we're using a mock backend API (you're free to chose the req/res schema and endpoint URL).`}

let root_tree_data : tree_data = {
    label: "Main",
    children: [
        {
            label: "Theme Design",
            prompt: {
                handler: (inputs: object) => {
                    //Dynamic access
                    type ObjectKey = keyof typeof inputs;
                    const attr = 'description' as ObjectKey;
                    const d: string = inputs[attr];
                    return {
                        messages: [{
                            "role": "system",
                            "content": theme_sys
                        }, {
                            "role": "user",
                            "content": theme_turn1(d)
                        }]
                    }
                }
            },
            effect: async (response) => {
                //TODO write to file
                type ObjectKey1 = keyof typeof response;
                //const attr_in = 'in' as ObjectKey1;
                const attr_out = 'out' as ObjectKey1;
                await vsWriteFile("theme/design1.md", response[attr_out]);
            },
            children: [
                {
                    label: "Theme implementation",
                    prompt: {
                        handler: (inputs: object) => {
                            type ObjectKey1 = keyof typeof inputs;
                            const attr_in = 'in' as ObjectKey1;
                            const attr_out = 'out' as ObjectKey1;
                            const in1 = inputs[attr_in];
                            const out1 = inputs[attr_out];
                            type ObjectKey2 = keyof typeof in1;
                            const attr_description = 'description' as ObjectKey2;
                            const description = in1[attr_description];
                            return {
                                messages: [{
                                    "role": "system",
                                    "content": theme_sys
                                }, {
                                    "role": "user",
                                    "content": theme_turn1(description)
                                }, {
                                    "role": "assistant",
                                    "content": out1
                                }, {
                                    "role": "user",
                                    "content": theme_turn2
                                }]
                            }
                        }
                    },
                    effect: async (response) => {
                        type ObjectKey1 = keyof typeof response;
                        const attr_out = 'out' as ObjectKey1;
                        await vsWriteFile("theme/design2.md", response[attr_out]);
                    },
                    children: []
                }
            ]
        },
        {
            label: "Design Site map",
            prompt: {
                handler: (inputs: object) => {
                    type ObjectKey = keyof typeof inputs;
                    const attr = 'description' as ObjectKey;
                    const d: string = inputs[attr];
                    return {
                        messages: [{
                            "role": "system",
                            "content": sitemap_sys
                        }, {
                            "role": "user",
                            "content": `Project description: ${d}`
                        }]
                    }
                },
                parser: (cur_tree_node: tree_data, inputs: object, res: string) => {
                    type ObjectKey = keyof typeof inputs;
                    const attr = 'description' as ObjectKey;
                    const d: string = inputs[attr];
                    // TODO
                    interface UIPage {
                        name: string,
                        desc: string,
                        compName: string,
                        url: string
                    }
                    const parsed: UIPage[] = JSON.parse(res);
                    const req = d;
                    for (const p of parsed) {
                        const coding_prompt = coding_template(req, p.name, p.desc, p.compName, p.url);
                        const fileName = `impl/${p.compName}.md`;
                        const new_node: tree_data = {
                            label: `Impl page: ${p.name}`,
                            prompt: {
                                handler: (inputs: object) => {
                                    return {
                                        messages: [{
                                            "role": "system",
                                            "content": coding_sys
                                        }, {
                                            "role": "user",
                                            "content": coding_prompt
                                        }]
                                    }
                                }
                            },
                            effect: async (response) => {
                                type ObjectKey1 = keyof typeof response;
                                const attr_out = 'out' as ObjectKey1;
                                await vsWriteFile(fileName, response[attr_out]);
                            },
                            children: []
                        }
                        cur_tree_node.children[1].children.push(new_node);
                    }
                    return { out: res }
                }
            },
            effect: async (response) => {
                type ObjectKey1 = keyof typeof response;
                const attr_out = 'out' as ObjectKey1;
                await vsWriteFile("diagnosis/sitemap.txt", response[attr_out]);
            },
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

export { root_tree_data };
