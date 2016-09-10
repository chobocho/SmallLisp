/*
 * Simple List
 *    
 * Version : 0.627GI1
 * Update  : 2016. 9. 10
 *
 */

 // 2016. 9. 2  : Add code to support simple lisp 
 // 2016. 9. 3  : Add code to support divide  
 // 2016. 9. 10 : Add code to support if
 
/*-----------------------------------------------*
 *  Global variables
 *-----------------------------------------------*/
var DEBUG_PRINT = false;  // Debug Mode Option
var TRACE_PRINT = true;   // Trace Mode Option
 
 
// Type of Token
var TOKEN_DIVIDE   = '/';
var TOKEN_PLUS     = '+';
var TOKEN_MINUS    = '-';
var TOKEN_MULTI    = '*';
var TOKEN_LBRACE   = '{';
var TOKEN_RBRACE   = '}';
var TOKEN_LPAREN   = '(';
var TOKEN_RPAREN   = ')';
var TOKEN_EQ       = '=';
var TOKEN_GT       = '>';
var TOKEN_GL       = '<';
var TOKEN_GE       = '>=';
var TOKEN_LE       = '<=';



// Type of Error
var SYNTAX            = 100;
var UNBALANCED_PARENS = 101;
var NOEXPRESSION      = 102;
var DIVIDE_BY_ZERO    = 103;
 

// Type of End
var ErrorMessage      = "";
var IsOccuredError    = false;

var source_code       = "";
var dict              = [];            

/*-----------------------------------------------*
 *  Main Function
 *-----------------------------------------------*/
function main(args) {

    var Result = "";
    
    //Tokenize
    source_code = args.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
    tokens = [];
    
    do {
        read_from_tokens(source_code, tokens);
        TRACE(tokens);
        var token = tokens.shift();
        TRACE ("REP:");
        TRACE (token);
        var temp = lispEval(token, dict); 
        Result += temp + ((temp === "") ? "" : "\n");
        TRACE ("ANSWER :");
        TRACE (source_code);
    } while(source_code[0] != undefined);
 
        
    if (IsOccuredError == true)
    {
        Result = ErrorMessage;
    } 
     
    return Result;
}


function makeTable(dic){

}

function lispEval(token, dict) {
    TRACE ("lispEval > " + token + " " + typeof(token));
    var ans = ""; 
    
    if (typeof(token) === "string") {
        return dict[token];
    }

    else if (typeof(token) !== "object") {
        return token;
    }
    
    switch(token[0]) {
        case TOKEN_PLUS:
        case TOKEN_MINUS:
        case TOKEN_MULTI:
        case TOKEN_DIVIDE:
            var opToken = token[0];
            TRACE ("lispTOKEN_MULTI Eval : " + opToken);
            token.shift();
            ans = lispEval(token.shift(), dict);
            var nextToken = lispEval(token.shift(), dict);
            do {
                ans = doOperation(opToken, ans, lispEval(nextToken, dict) );  
                nextToken = token.shift();
                TRACE ("NextToken " + nextToken);
            } while (nextToken != undefined);
            TRACE ("lispEval + " + ans);
        break;

        case TOKEN_EQ:
        case TOKEN_GT:
        case TOKEN_GL:
        case TOKEN_GE:
        case TOKEN_LE:
        {
            var opToken = token[0];
            TRACE ("lispEval : <>=" + token[0]);
            token.shift();
            var leftToken  = lispEval(token.shift(), dict);
            var rightToken = lispEval(token.shift(), dict);
            if ( opToken === TOKEN_EQ ) {
                return (leftToken === rightToken);
            }
            else if (opToken === TOKEN_GT) {
                return (leftToken > rightToken);
            }
            else if (opToken === TOKEN_GL) {
                return (leftToken < rightToken);
            }
            else if (opToken === TOKEN_GE) {
                return (leftToken >= rightToken);
            }
            else if (opToken === TOKEN_LE) {
                return (leftToken <= rightToken);
            }
            TRACE ("Error : Never come to here!")
        }
        break;
            
        case "define":
		case "set!":
            TRACE ("lispEval : DEFINE");
            token.shift();
            var nextToken = token.shift();
            dict[nextToken] = token.shift();
            ans = "";
            break;
            
        case "lambda":
            TRACE ("lispEval : LAMBDA");
            token.shift();
            var funcParam = token.shift();
            var funcBody  = token.shift();
            // 파라미터를 리스트에 추가하기 
			// 단 파라미터 리스트가 복구 되어야 함
			//  dict = UpdateDict(funcParam);
            ans = doLambda(funcParam, funcBody, dict);
			// 끝나면 파라미터 리스트가 복구 되어야함
            break;
        
        case "if":
            TRACE("lispEval : if");
            token.shift();
            var bCondToken = lispEval(token.shift(), dict);
            var stConseqToken = token.shift();
            var stAlterToken = token.shift();
            var ans;
            ans = (bCondToken) ? stConseqToken : stAlterToken; 
            TRACE (ans); 
            ans = lispEval(ans, dict);
            break;
            
        default:
            ans = token;
            TRACE (ans);
            break;
    }

    return ans;        
}


function doOperation(op, left, right) {
    switch(op) {
        case TOKEN_PLUS:
             left += right;
        break;
        case TOKEN_MINUS:
             left -= right;
        break;
        case TOKEN_MULTI:
             left *= right;
        break;
        case TOKEN_DIVIDE:
             left /= right;
        break;
        default:
             TRACE ("doOperation : ERROR");
        break;
    }
    return left;
}

function read_from_tokens(input, output) {
    TRACE ("read_from_tokens");
    
    token = input.shift();
    TRACE(token);
                    
    switch(token) {
        case undefined:
            output.pop();
            TRACE("input is null");
            break;

        case TOKEN_LPAREN:
            var list = [];
            while (input[0] != TOKEN_RPAREN) {
                       read_from_tokens(input, list);
                }
                input.shift(); // Remove ')'
                output.push(list);
            break;
                        
        case TOKEN_RPAREN:
            onError("Error : Start with ')'!");
            break;
                
        default:
            if ( isDigit(token.charAt(0))) {
                TRACE ("Digit " + token);
                output.push(parseInt(token));
            } else {
                output.push(token);
            }
            break;
    } 
}

function onError(msg){
    IsOccuredError = true;
    ErrorMessage = msg;
    TRACE(msg);
}

function isDigit ( ch )
{
    if ("0123456789".indexOf(ch) != -1)
        return true;
    return false;
}

function PrintError (str)
{
    if (DEBUG_PRINT == true)
    {
        console.log(str);
    }
    else 
    {
        tempStr = document.source_code.result_view.value;
        ErrorMessage = tempStr + "\n" + str;     
    }
    
    IsOccuredError = true;    
}

function TRACE (str)
{
    if (TRACE_PRINT == true)
    {
        console.log(str);    
    }    
}

