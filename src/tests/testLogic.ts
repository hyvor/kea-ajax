import {kea, reducers, path, actions} from "kea";
import { ajax } from '../../lib'

import type { blogLogicType } from "./testLogicType";
import type { User } from './user'

const blogLogic = kea<blogLogicType>([
    path(["app", "testLogic"]),
    actions({
        loading: (params) => ({params})
    }),
    ajax(({actions, values}) => ({
        load: ({isDev, user} : {isDev: boolean, user: User}) => {
            console.log("Hello World");
        },
        save: ({number}: {number: number}) => {
            console.log(number)
        }
    })),
    reducers({
        name: [
            'supun',
            {}
        ]

    })
])

export default blogLogic;