/*
 * Simple List
 *    
 * Version : 0.627GI1
 * Update  : 2016. 9. 10
 *
 */

 // 2016. 9. 2 : Add code to support simple lisp 
 // 2016. 9. 3 : Add code to support divide  
 
/*-----------------------------------------------*
 *  Global variables
 *-----------------------------------------------*/
var DEBUG_PRINT = false;  // Debug Mode Option
var TRACE_PRINT = true;   // Trace Mode Option
 
 
// Type of Token
var TOKEN_COMMENT_KW  = '#';
var TOKEN_EOL_KW      = ';';
var TOKEN_DEVIDE_KW   = '/';
var TOKEN_PLUS_KW     = '+';
var TOKEN_MINUS_KW    = '-';
var TOKEN_MULTI_KW    = '*';
var TOKEN_LBRACE_KW   = '{';
var TOKEN_RBRACE_KW   = '}';
var TOKEN_LPAREN_SZ   = '(';
var TOKEN_RPAREN_SZ   = ')';
var TOKEN_EQ          = '=';
var TOKEN_GT          = '>';
var TOKEN_GL          = '<';
var TOKEN_GE          = '>=';
var TOKEN_LE          = '<=';



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
        var temp = lispEval(token); 
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

function lispEval(token) {
    TRACE ("lispEval > " + token + " " + typeof(token));

    if (typeof(token) === "string") {
        return dict[token];
    }

    else if (typeof(token) !== "object") {
        return token;
    }

    switch(token[0]) {
        case TOKEN_PLUS_KW:
            TRACE ("lispEval : " + TOKEN_PLUS_KW);
            token.shift();
                var ans = parseInt(lispEval(token.shift()));
                var nextToken = token.shift();
                do {                              
                    ans += lispEval(nextToken); 
                    nextToken = token.shift();
                    TRACE ("NextToken " + nextToken);
                } while (nextToken != undefined);
                TRACE ("lispEval + " + ans);
                return ans;
        break;
        
        case TOKEN_MINUS_KW:
            TRACE ("lispEval : " + TOKEN_MINUS_KW);
            token.shift();
                var nextToken;
                var ans = parseInt(lispEval(token.shift()));
                nextToken = token.shift();
                do {        
                    ans -= lispEval(nextToken);
                    nextToken = token.shift();
                    TRACE ("NextToken " + nextToken);
                } while (nextToken != undefined);
                TRACE ("lispEval - " + ans);
                return ans;
        break;        
        
        case TOKEN_MULTI_KW:
            TRACE ("lispEval : "+TOKEN_MULTI_KW);
                token.shift();
                var nextToken;
                var ans = parseInt(lispEval(token.shift()));
                nextToken = token.shift();
                do {        
                    ans *= lispEval(nextToken);
                    nextToken = token.shift();
                    TRACE ("NextToken " + nextToken);
                } while (nextToken != undefined);
                TRACE ("lispEval * " +ans);
                return ans;
        break;
        
        case TOKEN_DEVIDE_KW:
            TRACE ("lispEval : " + TOKEN_DEVIDE_KW);
            token.shift();
            var nextToken;
            var ans = parseInt(lispEval(token.shift()));
            nextToken = token.shift();
            do {        
                ans /= lispEval(nextToken);
                nextToken = token.shift();
                TRACE ("NextToken " + nextToken);
            } while (nextToken != undefined);
            ans = parseInt(ans);
            TRACE ("lispEval / " +ans);
            return ans;
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
            var leftToken  = lispEval(token.shift());
            var rightToken = lispEval(token.shift());
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
            TRACE ("lispEval : DEFINE");
            token.shift();
            var nextToken = token.shift();
            dict[nextToken] = token.shift();
            break;
            
        case "lambda":
            TRACE ("lispEval : LAMBDA");
            token.shift();
            var funcParam = token.shift();
            var funcBody  = token.shift();
            UpdateDict(funcParam)
            return lispEval(funcBody);

            break;
        
		case "if":
		    TRACE("lispEval : if");
			token.shift();
			var bCondToken = lispEval(token.shift());
			var stConseqToken = token.shift();
			var stAlterToken = token.shift();
		 	var ans;
		    ans = (bCondToken) ? stConseqToken : stAlterToken; 
		    TRACE (ans); 
		    return lispEval(ans);
			break;
			
            TRACE (ans);
            return ans;
            break;
    }

    return "";        
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

        case TOKEN_LPAREN_SZ:
            var list = [];
            while (input[0] != TOKEN_RPAREN_SZ) {
                       read_from_tokens(input, list);
                }
                input.shift(); // Remove ')'
                output.push(list);
            break;
                        
        case TOKEN_RPAREN_SZ:
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

function isDelimiter ( ch )
{
    if ("+-/*=(){}@;".indexOf(ch) != -1)
        return true;
    return false;
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

