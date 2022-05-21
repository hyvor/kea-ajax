import { kea, reducers, path } from "kea";
import { ajax } from '../lib'

import type { blogLogicType } from "./testLogicType";

const blogLogic = kea<blogLogicType>([path(["app", "testLogic"]), ajax({
    loading: () => {
        console.log("Hello Worlds");
    },
}), reducers({
    name: [
        'supun',
        {}
    ]
})])

export default blogLogic;