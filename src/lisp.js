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
 // 2016. 9. 11 : Add code to support lambda
 
/*-----------------------------------------------*
 *  Global variables
 *-----------------------------------------------*/
var TRACE_PRINT = true;   // Trace Mode Option
 
 
// Type of Token
var TOKEN_DIVIDE   = '/';
var TOKEN_PLUS     = '+';
var TOKEN_MINUS    = '-';
var TOKEN_MULTI    = '*';
var TOKEN_LPAREN   = '(';
var TOKEN_RPAREN   = ')';
var TOKEN_EQ       = '=';
var TOKEN_GT       = '>';
var TOKEN_GL       = '<';
var TOKEN_GE       = '>=';
var TOKEN_LE       = '<=';


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


function copyObj(ob){
    if (ob && typeof(ob) == "object") {
        var t = new ob.constructor(); 
        for(var key in ob) {
            t[key] = copyObj(ob[key]);
        }
        return t;
    }
    return ob;
}

function makeDictTable(dict, funcParam, args){
    TRACE ("makeDictTable funcP" + funcParam + " Args: " + args);
    
    var newDict = copyObj(dict);
    
    for(var i = 0; i < funcParam.length; i++) {
       newDict[ funcParam[i] ] = args[i];
    }
    TRACE (newDict);
    return newDict;
}

function lispEval(token, dict) {
    TRACE ("lispEval >> " + token + " " + typeof(token));
    var ans = ""; 
    
    if (typeof(token) === "string") {
        TRACE ("String " + dict[token]);
        return dict[token];
    }

    else if (token instanceof Array === false) {
        return token;
    }
    
    TRACE ("lispEval token[0] " + token[0]);
    switch(token[0]) {
        case TOKEN_PLUS:
        case TOKEN_MINUS:
        case TOKEN_MULTI:
        case TOKEN_DIVIDE:
            var opToken = token[0];
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
            token.shift();
            var nextToken = token.shift();
            dict[nextToken] = token.shift();
            ans = "";
            break;
            
        case "if":
            token.shift();
            var bCondToken = lispEval(token.shift(), dict);
            var stConseqToken = token.shift();
            var stAlterToken = token.shift();
            ans = (bCondToken) ? stConseqToken : stAlterToken; 
            TRACE (ans); 
            ans = lispEval(ans, dict);
            break;
            
        default:
            TRACE ("Default");
            if ( typeof(token[0]) === "string") {
                TRACE(token);
                var funcToken = copyObj(dict[token[0]]);
                token.shift();
                var args = [];
                for( var i = 0; i < token.length; i++) {
                    args[i] = lispEval(token[i], dict);
                }
                
                if (funcToken[0] === "lambda") {
                    funcToken.shift(); // Remove 'lambda'
                    var funcParam = funcToken.shift();
                    var funcBody  = funcToken.shift();
                    ans = lispEval(funcBody, makeDictTable(dict, funcParam, args));
                } else {
                    TRACE ("Error : Not function");
                }
            } else {
                ans = token;
            }
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

function TRACE (str)
{
    if (TRACE_PRINT == true)
    {
        console.log(str);    
    }    
}

