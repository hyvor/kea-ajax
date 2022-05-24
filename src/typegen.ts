import {VisitKeaPropertyArguments} from "kea-typegen";
import { gatherImports } from 'kea-typegen/dist/src/utils'
import ts, {factory, SyntaxKind} from "typescript";
import {cloneNode} from '@wessberg/ts-clone-node'

function getParameterDeclaration(param: ts.ParameterDeclaration) {
    return factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier(param.name.getText()),
        param.initializer || param.questionToken ? factory.createToken(SyntaxKind.QuestionToken) : undefined,
        cloneNode(param.type || factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)),
        undefined,
    )
}

export function ajax({ parsedLogic, node, getTypeNodeForNode, prepareForPrint }: VisitKeaPropertyArguments) {

    const { checker } = parsedLogic

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
        const ajaxKey = property.name?.getText() as string;

        if (!ts.isPropertyAssignment(property) || !ts.isFunctionLike(property.initializer)) {
            return;
        }


        // = REDUCERS
        parsedLogic.reducers.push({
            name: ajaxKey + "Ajax",
            typeNode: factory.createTypeLiteralNode([
                factory.createPropertySignature(
                    undefined,
                    factory.createIdentifier("status"),
                    undefined,
                    factory.createUnionTypeNode([
                        factory.createLiteralTypeNode(factory.createNull()),
                        factory.createLiteralTypeNode(factory.createStringLiteral("loading")),
                        factory.createLiteralTypeNode(factory.createStringLiteral("success")),
                        factory.createLiteralTypeNode(factory.createStringLiteral("error"))
                    ])
                ),
                factory.createPropertySignature(
                    undefined,
                    factory.createIdentifier("error"),
                    undefined,
                    factory.createUnionTypeNode([
                        factory.createLiteralTypeNode(factory.createNull()),
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                    ])
                )
            ])
        })


        // = ACTIONS

        const func = property.initializer
        const param = func.parameters ? func.parameters[0] : null
        const parameters = param ? [getParameterDeclaration(param)] : []

        if (param) {
            gatherImports(param, checker, parsedLogic)
        }

        const returnTypeNode = factory.createKeywordTypeNode(SyntaxKind.VoidKeyword)

        parsedLogic.actions.push({
            name: ajaxKey,
            parameters,
            returnTypeNode
        })

        parsedLogic.actions.push({
            name: ajaxKey + "Start",
            parameters: [],
            returnTypeNode
        })
        parsedLogic.actions.push({
            name: ajaxKey + "Success",
            parameters: [],
            returnTypeNode
        })
        parsedLogic.actions.push({
            name: ajaxKey + "Error",
            parameters: [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    factory.createIdentifier('error'),
                    undefined,
                    factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
                    undefined,
                )
            ],
            returnTypeNode
        })

    }

}