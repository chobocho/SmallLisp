#Small Lisp 만들기

**자바스크립트를 공부하면서 간단한 lisp interpreter를 만들어 보기로 하고,  
구글링을 통해서 찾은 사이트 <http://norvig.com/lispy.html>를 참고하여서 만들어 보았다.**

* Test site : <http://www.chobocho.com/javascript/lisp.html>


## 1. 목 표
 
아래 코드를 실행 하여 결과를 출력

```
(define pi 3)  
(if (= pi 3) (+ 4 5) (* 4 5 ))  
(define twice (lambda (x) (* 2 x)))  
(twice 2)  
(define forth (lambda (x) (* (twice x) (twice x))))  
(forth 2)  
(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))  
(fact 16)  
(fact (forth 2))  
```

## 2. lisp test를 위한 입력용 list.html 제작
```
<HTML>
<head>
<title>Small lisp</title>

<script language="JavaScript" src="lisp.js"></script> 

<script language="JavaScript">
function Run(form) { 
	form.result_view.value = main(form.source_view.value); 
}

function ClearForm(form) { 
	form.result_view.value = "";
    form.source_view.value = "";    
}

</script>
</head>
<body>

<!------------------------------------------------------------------
// 입력양식
------------------------------------------------------------------->
<FORM name=source_code>
    <TABLE cellSpacing=0 borderColorDark=white align=center borderColorLight=black border=1>
        <TR>
            <TD align="center">
            [ Lisp source ]
            </TD>
            <TD align="center">
            [ 결과 (Result) ]
            </TD>    
        </TR>
        <TR>
            <TD width=160 height=40>
                <SPAN style="FONT-SIZE: 9pt"><TextArea name="source_view" cols="50" rows="20"></textArea> </SPAN>
            </TD>
            <TD width=80 height=40>
                <SPAN style="FONT-SIZE: 9pt"><TextArea name="result_view" cols="20" rows="20"></textArea> </SPAN>
            </TD>
        </TR>
        <TR>
            <TD align="center" width=246 colSpan=2 height=25>
                <SPAN style="FONT-SIZE: 9pt"><INPUT type="button" value="Run", onClick="Run(this.form)"> </SPAN>
                <SPAN style="FONT-SIZE: 9pt"><INPUT type="button" value="Clear", onClick="ClearForm(this.form)"> </SPAN>
            </TD>
        </TR>
        <TR>
            <TD width=240 colSpan=2>
                Example<br>
                (+ 1  2  3)<br>
            </TD>
        </TR>         
    </TABLE>
 </FORM>
 
</body> 
</HTML>
```

## 3. Small Lisp 제작
###3.1 지원 할 명령어 리스트
Javascript 학습을 목적으로 만든 것이이서 최소한의 명령어만을 지원한다.

* 1)　+, -. *, /
* 2) <. >. =. <=. >=
* 3) define, if
* 4) lambda (* 쉬운 구현을 위하여 lambda의 인자로 lamdba 함수는 올 수 없도록 제한 함)

###3.2 제작 순서
* 1)　+, -. *, /  
* 2)  <. >. =. <=. >=  
* 3) define, if   
* 4) lambda   

###3.3 사칙 연산 계산 ( +. -. *. / )
먼저 (+ 5 5)를 처리하는 코드를 만들어 보자.  
먼저 (+ 5 5)를 파싱을 해주어야 한다. 이때, 파서를 따로 제작하지 않고,   
javascript string 객체에서 지원하는 메소드를 이용한다.  

###3.3.1 space 기준으로 자르기 위하여, ( )를 ‘ ( ’ 와 ‘ ) ’ 로 앞뒤에 space를 붙여준다.
> replace( /\(/g, " ( " );  
> replace( /\)/g, " ) " );  
그러나, 구문 제일 앞의 ‘ (’ 와 ‘) ’의 스페이스는 trim()을 이용해 제거를 해주어야 한다.  
그렇지 않으면, 파싱된 Token에 “ ”가 구문의 제일 앞과 뒤에 추가 된다.  
이걸 정리하면 아래와 같은 코드가 나오고,   

```
function main(args) {
    //Tokenize
    source_code = args.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
}
```

> 입력 (+ 3 5)  
> source_code : (,+,3,5,)  

이런 실행 결과를 얻을 수 있다.

###3.3.2 소스를 읽어서 ( ) 로 분리한다.
```
// @input : 입력 토큰 리스트
// @output : ( )로 분리한 토큰 리스트 
function read_from_tokens(input, output) {
    // 첫 번째 토큰을 꺼낸다.
    token = input.shift();

    switch(token) {
        case undefined:
            output.pop();
            break;

        case ‘(’:
            // ‘(’ 와 ‘)’사이의 값을 까지 하나의 리스트에 저장한다.
            //  (+ 3 (+ 4 5)) 가 입력 된 경우 같이
            // ‘(’ ‘)’ 가 나오는 경우를 위하여 재귀 호출을 사용한다.
  
            var list = [];
            while ( input[0] != ‘)’ ) {
                read_from_tokens(input, list);
            }
            input.shift(); // Remove ')'
            output.push(list);
            break;
                        
        case ‘)’:
            onError("Error : Start with ')'!");
            break;
                
        default:
            if ( isDigit(token.charAt(0)) ) {
                TRACE ("Digit " + token);
                output.push(parseInt(token));
            } else {
                output.push(token);
            }
            break;
    } 
}

function isDigit ( ch )
{
    if ("0123456789".indexOf(ch) != -1)
        return true;
    return false;
}
```
