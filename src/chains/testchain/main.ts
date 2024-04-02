
import { tree_data } from '../datastruct'

let root_tree_data : tree_data = {
    label: "Main",
    children: [
        {
            label: "Theme Design",
            children: [],
            prompt: {
                handler: (inputs: object) => {
                    return {
                        messages: [{
                            "role": "system",
                            "content": ""
                        }]
                    }
                }
            },
            effect: async (response) => {
                //TODO write to file
            }
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

export { root_tree_data };
