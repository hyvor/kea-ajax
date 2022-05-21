import {
    actions,
    BreakPointFunction,
    BuiltLogic,
    getPluginContext,
    KeaPlugin,
    ListenerFunction, listeners,
    Logic,
    LogicBuilder, reducers
} from "kea";


export interface KeaAjaxOptionsCallbackArguments {
    actionKey: string,
    reducerKey: string,
    logic: BuiltLogic
}

export interface KeaAjaxOptions {

    onStart: ({reducerKey, actionKey, logic} : KeaAjaxOptionsCallbackArguments & {logic: Logic}) => void,
    onSuccess: ({reducerKey, actionKey, logic, response} : KeaAjaxOptionsCallbackArguments & {response: any}) => void,
    onError: ({reducerKey, actionKey, logic, error} : KeaAjaxOptionsCallbackArguments & {error: Error}) => void

}

export type KeaAjaxDefinitions<LogicType extends Logic> = {
    [K in keyof LogicType['actionCreators']]: (
        payload?: ReturnType<LogicType['actionCreators'][K]>['payload'],
        breakpoint?: BreakPointFunction,
        action?: ReturnType<LogicType['actionCreators'][K]>,
    ) => Promise<any> | void
}

export interface KeaAjaxObject {

    status: null | 'loading' | 'success' | 'error',
    error: string | null,


}

export const ajaxPlugin = (options: Partial<KeaAjaxOptions> = {}) : KeaPlugin => {

    return {

        name: "ajax",
        events: {
            afterPlugin: () => {
                const pluginContext = getPluginContext<KeaAjaxOptions>("ajax");
                pluginContext.onStart = options.onStart ?? (() => {})
                pluginContext.onSuccess = options.onSuccess ?? (() => {})
                pluginContext.onError = options.onError ??
                    function ({ error, actionKey, reducerKey, logic }) {
                        console.error(`Error in ${actionKey} for ${reducerKey}:`, error)
                    }
            },
            legacyBuildAfterDefaults: (logic, input) => {
                'ajax' in input && ajax(input.ajax)(logic);
            }
        }

    }

}

export function ajax<L extends Logic = Logic>(
    input: KeaAjaxDefinitions<L> | ((logic: L) => KeaAjaxDefinitions<L>)
) : LogicBuilder<L> {

    return (logic) => {

        // run the loaders function with the already created logic as an input,
        // so it can do ({ actions, ... }) => ({ ... })
        const ajax = typeof input === 'function' ? input(logic) : input

        for (const [key, handler] of Object.entries(ajax)) {

            const newActions: Record<string, any> = {};
            newActions[key] = (params: any) => params || {};
            newActions[key + "Start"] = false;
            newActions[key + "Success"] = false;
            newActions[key + "Error"] = (error: any) => ({error});

            const newReducers:
                Record<string, [
                    KeaAjaxObject,
                    Record<string, (state: any, payload: any) => KeaAjaxObject>
                ]> =  {};
            newReducers[key + "Ajax"] = [
                {
                    status: null,
                    error: null
                },
                {
                    [key + "Start"]: () => ({
                        status: "loading",
                        error: null
                    }),
                    [key + "Success"]: () => ({
                        status: "success",
                        error: null
                    }),
                    [key + "Error"]: (_, {error}) => ({
                        status: "error",
                        error
                    })
                }
            ]


            const newListeners: Record<string, ListenerFunction> = {};
            newListeners[key] = (payload = {}, breakpoint, action) => {
                logic.actions[key + "Start"]();
                try {
                    const response = handler(payload, breakpoint, action);
                    if (response && response.then && typeof response.then === "function") {
                        return response
                            .then(() => logic.actions[key + "Success"]())
                            .catch((error: Error) => {
                                logic.actions[key + "Error"](error.message)
                            })
                    } else {
                        logic.actions[key + "Success"]();
                    }
                } catch (error) {
                    logic.actions[key + "Error"]((error as any).message)
                }
            }

            // @ts-ignore
            actions<L>(newActions)(logic)
            // @ts-ignore
            reducers<L>(newReducers)(logic)
            listeners(newListeners)(logic)

        }

    }

}