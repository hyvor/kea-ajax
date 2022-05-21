import {ParsedLogic, VisitKeaPropertyArguments} from "kea-typegen";
import ts, { Type } from "typescript";

export function ajax({ parsedLogic, node, getTypeNodeForNode, prepareForPrint }: VisitKeaPropertyArguments) {

    // extract `() => ({})` to just `{}`
    if (
        ts.isArrowFunction(node) &&
        ts.isParenthesizedExpression(node.body) &&
        ts.isObjectLiteralExpression(node.body.expression)
    ) {
        node = node.body.expression
    }

    // make sure we have a {}
    if (!ts.isObjectLiteralExpression(node)) {
        return
    }

    for (const property of node.properties) {
        console.log("Hey there!")
    }

}