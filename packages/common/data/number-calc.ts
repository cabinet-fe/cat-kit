// 3 + (2 + 5) - (3 + 5 / (2 + 3)) - 2 + 5
// 3 + 7 - (3 + 5 / 5) - 2 + 5
// 3 + 7 - (3 + 1) - 2 + 5

// 1.定义一颗抽象树, 当前表达初始等于抽象树
// 2.往树的左边插入一个字面量3
// 3.往树的操作符号插入+
// 4.看到(往树的右边插入一个空表达式, 定义当前表达式为该空表达式
// 5.往当前树的左边插入一个字面量2
// 6.往当前树的操作符插入+
// 7.往当前树的右边插入一个字面量5
// 8.看到当前树节点已满, 抽象树节点已满, 且-符号的优先级为低, 则新增一颗抽象树,
// 抽象树的左节点为此前的抽象树, 当前表达式为该抽象树. 如果遇到高优先级符号, 则
// 抽象树右节点被置换为一个表达式, 且该表达式的左节点为被置换的节点, 当前表达式为
// 该表达式

// class Expression {
//   operator?: '+' | '-' | '*' | '/'
//   left?: NumberLiteral | Expression
//   right?: NumberLiteral | Expression
//   constructor(options: {
//     left?: NumberLiteral | Expression
//     right?: NumberLiteral | Expression
//     operator?: '+' | '-' | '*' | '/'
//   }) {
//     this.left = options.left
//     this.right = options.right
//     this.operator = options.operator
//   }
// }

// class NumberLiteral {
//   value!: number
//   constructor(n: number) {
//     this.value = n
//   }
// }

// type Token =
//   | {
//       type: 'number'
//       value: number
//     }
//   | {
//       type: 'op'
//       value: string
//     }

// /** 词法分析 */
// const scan = (str: string) => {
//   const tokens: Token[] = []

//   let i = 0
//   let tokenVal = ''
//   while (i < str.length) {
//     let c = str[i]!
//     i++
//     if (c === ' ') continue
//     // 可能组成数字的字符
//     if (/[\d\.]/.test(c)) {
//       if (tokenVal[tokenVal.length - 1] === '.' && c === '.') {
//         throw new Error('表达式错误')
//       } else {
//         tokenVal += c
//       }
//       continue
//     }
//     if (/[\*\/\%\(\)]/.test(c)) {
//       if (tokenVal) {
//         tokens.push({ type: 'number', value: +tokenVal })
//         tokenVal = ''
//       }
//       tokens.push({ type: 'op', value: c })
//       continue
//     }
//     // (1 + 2) + 4
//     // 操作符
//     if (/[\+\-]/.test(c)) {
//       if (tokenVal) {
//         tokens.push({ type: 'number', value: +tokenVal })
//         tokenVal = ''
//         tokens.push({ type: 'op', value: c })
//       } else {
//         tokenVal += c
//       }
//     }
//   }

//   return tokens

//   // let groupStack: string[] = []

//   // /** 语法树 */
//   // let ast: Expression = new Expression({})
//   // let currentExpression: Expression | null = ast
//   // let numberLiteral = ''

//   // const setExpression = (exp: Expression) => {
//   //   if (!ast.left) {
//   //     ast.left = exp
//   //   } else if (!ast.right) {
//   //     ast.right = exp
//   //   } else {
//   //     throw new Error('表达式错误')
//   //   }

//   // }

//   // const setLiteral = (literal: NumberLiteral) => {
//   //   if (!ast.left) {
//   //     ast.left = literal
//   //   } else if (!ast.right) {
//   //     ast.right = literal
//   //   } else {
//   //     throw new Error('表达式错误')
//   //   }
//   // }

//   // const setOperator = (operator: '+' | '-' | '*' | '/') => {
//   //   if (!currentExpression) {
//   //     throw new Error('表达式错误')
//   //   }
//   //   if (currentExpression.operator) {
//   //     if (!currentExpression.left || !currentExpression.right) {
//   //       throw new Error('表达式错误')
//   //     }
//   //     if (/[\+-]/.test(operator)) {

//   //       ast = new Expression({
//   //         left: ast,
//   //         operator
//   //       })
//   //       currentExpression = ast
//   //     } else if (/[\*\/]/.test(operator)) {
//   //       currentExpression.right = new Expression({
//   //         left: ast.right,
//   //         operator
//   //       })
//   //       currentExpression = ast
//   //     }

//   //   } else {
//   //     ast.operator = operator
//   //   }
//   // }

//   // const charOperate = {
//   //   '(': () => {
//   //     setExpression(new Expression({}))
//   //     groupStack.push('(')
//   //   },
//   //   ')': () => {
//   //     if (groupStack[groupStack.length - 1] === '(') {
//   //       groupStack.pop()
//   //     } else {
//   //       throw new Error('表达式错误')
//   //     }
//   //   },
//   //   // 低优先级
//   //   '+': () => {
//   //     setOperator('+')
//   //   },
//   //   '-': () => {
//   //     setOperator('-')
//   //   },

//   //   // 高优先级
//   //   '*': () => {
//   //     setOperator('*')
//   //   },
//   //   '/': () => {
//   //     setOperator('/')
//   //   }
//   // }

//   // let i = 0

//   // while (i < str.length) {
//   //   const c = str[i]!

//   //   // 对象字面量
//   //   if (/\d/.test(c)) {
//   //     numberLiteral += c
//   //   } else {
//   //     // 如果存在对象字面量
//   //     if (numberLiteral) {
//   //       setLiteral(new NumberLiteral(+numberLiteral))
//   //       numberLiteral = ''
//   //     }

//   //     if (c === ' ') continue

//   //     if (charOperate[c]) {
//   //       charOperate[c]()
//   //     }
//   //   }

//   //   i++
//   // }

//   // return ast
// }

// /**
//  * 精确计算
//  * @param expression 计算表达式
//  */
// n.calc = function (expression: string) {
//   try {
//     console.log(scan(expression))
//   } catch (e) {
//     console.error(e)
//   }
//   return 1
// }
