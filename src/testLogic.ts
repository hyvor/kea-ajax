import {kea, reducers, path, actions} from "kea";
import { ajax } from '../src'

import type { blogLogicType } from "./testLogicType";

const blogLogic = kea<blogLogicType>([
    path(["app", "testLogic"]),
    actions({
        loading: (params) => ({params})
    }),
    ajax(({actions, values}) => ({
        load: ({isDev}) => {
            console.log("Hello Worlds");
        },
    })),
    reducers({
        name: [
            'supun',
            {}
        ]

    })
])

export default blogLogic;