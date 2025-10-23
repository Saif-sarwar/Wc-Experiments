const args = process.argv.slice(2); 


if (args.length !== 3) {
  console.log('Error: Please provide exactly three arguments.');
  console.log('Usage: node calculator.js [number1] [operator] [number2]');
  console.log('Example: node calculator.js 10 + 5');
  process.exit(1); 
}


const num1Str = args[0];
const operator = args[1];
const num2Str = args[2];


const num1 = parseFloat(num1Str);
const num2 = parseFloat(num2Str);


if (isNaN(num1) || isNaN(num2)) {
  console.log('Error: Invalid numbers.');
  console.log('Please make sure you enter valid numbers for the first and third arguments.');
  console.log('Example: node calculator.js 10 + 5');
  process.exit(1);
}



let result;

switch (operator) {
  case '+':
    result = num1 + num2;
    break;
  case '-':
    result = num1 - num2;
    break;
  case '*':
  case 'x': 
    result = num1 * num2;
    break;
  case '/':
    if (num2 === 0) {
      console.log('Error: Cannot divide by zero.');
      process.exit(1); 
    }
    result = num1 / num2;
    break;
  default:
    
    console.log('Error: Invalid operator.');
    console.log('Please use one of: +, -, *, /');
    process.exit(1); 
}




console.log(`Result: ${num1} ${operator} ${num2} = ${result}`);