import { type CallExpression, Project, ScriptTarget, SyntaxKind } from '@ts-morph/ts-morph'
import { assertionPatterns } from '../utils/assertion-patterns.ts'

type BuildTreeResult = {
  name: string
  literals: string[]
  callbacks: BuildTreeResult[]
}

const project = new Project({
  compilerOptions: {
    target: ScriptTarget.Latest,
  },
})

const assertMethods = Object.keys(assertionPatterns)
const unquote = (str: string): string => str.replace(/['"]/g, '')

const buildTree = (callExpression: CallExpression): BuildTreeResult => {
  const name = callExpression.getExpression().getText()
  const args = callExpression.getArguments()

  const literals = args
    .filter((arg) => [SyntaxKind.StringLiteral, SyntaxKind.NumericLiteral].includes(arg.getKind()))
    .map((arg) => arg.getText())

  const callbacks = args
    .filter((arg) => arg.getKind() === SyntaxKind.ArrowFunction)
    .flatMap((callback): BuildTreeResult[] => {
      const arrowFunction = callback.asKindOrThrow(SyntaxKind.ArrowFunction)
      const body = arrowFunction.getBody()

      // Get call expressions from expression statements (like assertEquals)
      const expressionCalls = body.getChildrenOfKind(SyntaxKind.ExpressionStatement)
        .map((statement) => statement.getExpression())
        .filter((expression) => expression.getKind() === SyntaxKind.CallExpression)
        .map((expression) => expression.asKindOrThrow(SyntaxKind.CallExpression))

      // Get call expressions from variable statements (like const result = testFn(...))
      // TODO: Currently, the test function must be named 'testFn'. Make this configurable.
      // TODO: Consider allowing the function name to be set using a comment decorator (e.g., //@cynthia-test-fn myFunction) similar to @ts-nocheck.
      // TODO: The test function call expression must be in a variable statement (e.g., const result = testFn(...)). Consider supporting other patterns.
      const variableCalls = body.getChildrenOfKind(SyntaxKind.VariableStatement)
        .flatMap((statement) => statement.getDeclarationList().getDeclarations())
        .map((declaration) => declaration.getInitializer())
        .filter((initializer) => initializer !== undefined)
        .filter((initializer) => initializer.getKind() === SyntaxKind.CallExpression)

      return [...expressionCalls, ...variableCalls]
        .map((callExpression) => buildTree(callExpression.asKindOrThrow(SyntaxKind.CallExpression)))
    })

  return {
    name,
    literals,
    callbacks,
  }
}

const compileTree = (tree: BuildTreeResult[], depth = 0): string => {
  return tree
    .map((node) => {
      const indent = '  '.repeat(depth)

      if (node.name === 'describe') {
        return (
          `${indent}Feature: ${unquote(node.literals[0])}\n\n` +
          compileTree(node.callbacks, depth + 1)
        )
      }

      if (node.name === 'it') {
        const testFnNode = node.callbacks.find((childNode) => childNode.name === 'testFn')
        const assertNode = node.callbacks.find((childNode) => assertMethods.includes(childNode.name))

        if (!testFnNode || !assertNode) {
          return compileTree(node.callbacks, depth)
        }

        const pattern = assertionPatterns[assertNode.name]
        const expectedValue = pattern && pattern.argIndex >= 0 ? assertNode.literals[pattern.argIndex] : ''
        const template = pattern ? pattern.template : 'should return'

        return (
          `${indent}Scenario: ${unquote(node.literals[0])}\n` +
          `${indent}  Given input ${testFnNode.literals[0]}\n` +
          `${indent}  Then it ${template} ${expectedValue}`
        )
      }

      return compileTree(node.callbacks, depth)
    })
    .filter((s) => s.trim())
    .join('\n\n')
}

export const testMorph = (filePath: string) => {
  const sourceFile = project.addSourceFileAtPath(filePath)

  const testTree = sourceFile.getStatements()
    .filter((statement) => statement.getKind() === SyntaxKind.ExpressionStatement)
    .map((statement) => statement.asKindOrThrow(SyntaxKind.ExpressionStatement).getExpression())
    .filter((expression) => expression.getKind() === SyntaxKind.CallExpression)
    .map((expression) => buildTree(expression.asKindOrThrow(SyntaxKind.CallExpression)))

  return compileTree(testTree)
}
