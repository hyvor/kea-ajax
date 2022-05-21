/* global test, expect, beforeEach */
import { resetContext, kea } from "kea";
import { ajaxPlugin } from "../lib";

beforeEach(function() {

    resetContext({
        plugins: [ajaxPlugin()]
    })

});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

it('sets actions, sets values, and works', async () => {

    const logic = kea({
        actions: {
            set: (data) => ({data})
        },
        ajax: ({actions}) => ({
            load: async () => {
                await delay(2);
                actions.set('hello async');
            },
            loadSync: () => {
                actions.set('hello');
            }
        }),
        reducers: {
            data: [
                null,
                {
                    set: (_, {data}) => data
                }
            ]
        }
    })

    const unmount = logic.mount();

    expect(Object.keys(logic.actions)).toEqual([
        'set',
        'load',
        'loadStart',
        'loadSuccess',
        'loadError',
        'loadSync',
        'loadSyncStart',
        'loadSyncSuccess',
        'loadSyncError'
    ]);

    expect(Object.keys(logic.values)).toEqual([
        'loadAjax',
        'loadSyncAjax',
        'data',
    ])


    expect(logic.values.data).toBeNull()
    logic.actions.loadSync()
    expect(logic.values.data).toBe('hello');


    expect(logic.values.loadAjax.status).toBeNull()
    expect(logic.values.loadAjax.error).toBeNull()
    logic.actions.load();
    expect(logic.values.loadAjax.status).toBe('loading')
    await delay(5)
    expect(logic.values.loadAjax.status).toBe('success')
    expect(logic.values.data).toBe('hello async');

    unmount()

});

test('error', async () => {

    const logic = kea({
        ajax: {
            load: async() => {
                const f = () => new Promise(() => {throw new Error("Bad");})
                await f();
            },
            loadSync: () => {
                throw new Error("Very bad");
            }
        }
    })

    const unmount = logic.mount();

    expect(logic.values.loadAjax.status).toBeNull()
    logic.actions.load();
    await delay(5)
    expect(logic.values.loadAjax.status).toBe('error')
    expect(logic.values.loadAjax.error).toBe('Bad')


    expect(logic.values.loadSyncAjax.status).toBeNull()
    logic.actions.loadSync();
    expect(logic.values.loadSyncAjax.status).toBe('error')
    expect(logic.values.loadSyncAjax.error).toBe('Very bad')

    unmount();

});