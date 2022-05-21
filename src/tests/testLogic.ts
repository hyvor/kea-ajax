import {kea, reducers, path, actions} from "kea";
import { ajax } from '../../lib'

import type { blogLogicType } from "./testLogicType";

const blogLogic = kea<blogLogicType>([
    path(["app", "testLogic"]),
    actions({
        loading: (params) => ({params})
    }),
    ajax(({actions, values}) => ({
        load: ({isDev} : {isDev: boolean}) => {
            console.log("Hello Worlds");
        },
        save: ({number}: {number: number}) => {
            console.log(number)
        }
    })),
    reducers({
        name: [
            'supuna',
            {}
        ]

    })
])

export default blogLogic;