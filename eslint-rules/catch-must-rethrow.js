// A catch block must relay the caught error unchanged, or — when the whole
// block is a single throw statement — replace it with a transformed error.
// A multi-statement catch may not end by throwing anything but the caught
// identifier; that keeps "relay or rethrow" from silently becoming "swallow
// and replace" once a catch block grows a second statement.
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that catch blocks end with rethrowing the caught error',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      missingRethrow:
        'Catch block must end with a throw statement that rethrows the caught error (throw {{paramName}})',
      wrongErrorThrown:
        'Catch block must rethrow the caught error "{{paramName}}", not "{{thrownName}}"',
    },
    schema: [],
  },
  create(context) {
    function isValidThrow(statement, paramName) {
      if (statement.type !== 'ThrowStatement') return false;
      const thrownExpression = statement.argument;
      return (
        thrownExpression?.type === 'Identifier' &&
        thrownExpression.name === paramName
      );
    }

    function endsWithValidRethrow(statement, paramName) {
      if (statement.type === 'ThrowStatement') {
        return isValidThrow(statement, paramName);
      }

      if (statement.type === 'IfStatement') {
        if (!statement.alternate) return false;

        if (statement.alternate.type === 'IfStatement') {
          return endsWithValidRethrow(statement.alternate, paramName);
        }

        if (statement.alternate.type === 'BlockStatement') {
          const elseBody = statement.alternate.body;
          if (elseBody.length === 0) return false;
          return endsWithValidRethrow(elseBody[elseBody.length - 1], paramName);
        }

        return endsWithValidRethrow(statement.alternate, paramName);
      }

      return false;
    }

    return {
      CatchClause(node) {
        const catchBody = node.body;
        const catchParam = node.param;
        const paramName =
          catchParam && catchParam.type === 'Identifier'
            ? catchParam.name
            : 'error';

        if (!catchBody.body || catchBody.body.length === 0) {
          context.report({
            node: catchBody,
            messageId: 'missingRethrow',
            data: { paramName },
          });
          return;
        }

        const lastStatement = catchBody.body[catchBody.body.length - 1];

        // A catch block that is a single throw statement may transform the
        // error, e.g. wrapping it into a domain-specific failure.
        if (
          catchBody.body.length === 1 &&
          lastStatement.type === 'ThrowStatement'
        ) {
          return;
        }

        if (endsWithValidRethrow(lastStatement, paramName)) {
          return;
        }

        if (lastStatement.type === 'ThrowStatement') {
          const thrownExpression = lastStatement.argument;

          if (thrownExpression && thrownExpression.type === 'Identifier') {
            const thrownName = thrownExpression.name;
            if (thrownName !== paramName) {
              context.report({
                node: thrownExpression,
                messageId: 'wrongErrorThrown',
                data: { paramName, thrownName },
              });
            }
          } else if (thrownExpression) {
            context.report({
              node: thrownExpression,
              messageId: 'wrongErrorThrown',
              data: { paramName, thrownName: 'a different value' },
            });
          }
          return;
        }

        context.report({
          node: lastStatement,
          messageId: 'missingRethrow',
          data: { paramName },
        });
      },
    };
  },
};
