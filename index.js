(()=>{var c=class{constructor(e,t,r){this.type=e;this.lexeme=t;this.literal=r}toString(){return`Token(${this.type}, ${this.lexeme}, ${this.literal})`}},u=class{constructor(e){this.source=e}scanTokens(){for(this.tokens=[],this.start=0,this.current=0;!this.isAtEnd();)this.start=this.current,this.scanToken();return this.tokens.push(new c(32,"",null)),this.tokens}scanToken(){let e=this.advance();switch(e){case"(":this.addToken(0);break;case")":this.addToken(1);break;case"{":this.addToken(8);break;case"}":this.addToken(9);break;case"[":this.addToken(12);break;case"]":this.addToken(13);break;case",":this.addToken(2);break;case".":this.addToken(3);break;case":":this.addToken(10);break;case"+":this.addToken(5);break;case"/":this.addToken(6);break;case"*":this.addToken(7);break;case"=":this.addToken(this.match("~")?23:11);break;case"?":this.addToken(this.match("?")?22:21);break;case"-":this.addToken(this.match(">")?20:4);break;case"!":this.addToken(this.match("=")?15:14);break;case">":this.addToken(this.match("=")?17:16);break;case"<":this.addToken(this.match("=")?19:18);break;case"|":this.match("|")?this.addToken(24):this.error("Invalid token");break;case"&":this.match("&")?this.addToken(25):this.error("Invalid token");break;case'"':this.string('"');break;case"'":this.string("'");break;case" ":case"	":break;case"\r":case`
`:this.error("New line not allowed");break;case"\0":break;default:this.isDigit(e)?this.number():this.isAlpha(e)?this.identifier():this.error(`Unexpected character ${e}`)}}addToken(e,t){let r=this.source.substring(this.start,this.current);this.tokens.push(new c(e,r,t))}isAtEnd(){return this.current>=this.source.length}advance(){return this.current++,this.source.charAt(this.current-1)}match(e){return this.isAtEnd()||this.source.charAt(this.current)!=e?!1:(this.current++,!0)}peek(){return this.isAtEnd()?"\0":this.source.charAt(this.current)}peekNext(){return this.current+1>=this.source.length?"\0":this.source.charAt(this.current+1)}string(e){let t="",r="";for(;!this.isAtEnd();){let n=this.peek();if(r=="\\")switch(n){case"n":t+=`
`;break;case"r":t+="\r";break;case"t":t+="	";break;case"\\":t+="\\";break;case e:t+=e;break;default:this.error(`Invalid escape sequence \\${n}`)}else{if(n===e)break;t+=n}r=n,this.advance()}this.isAtEnd()&&this.error("Unterminated string"),this.advance(),this.addToken(27,t)}number(){for(;this.isDigit(this.peek());)this.advance();if(this.peek()=="."&&this.isDigit(this.peekNext()))for(this.advance();this.isDigit(this.peek());)this.advance();this.addToken(28,Number(this.source.substring(this.start,this.current)))}identifier(){for(;this.isAlphaNumeric(this.peek());)this.advance();let e=this.source.substring(this.start,this.current),t=26;e=="null"?t=29:e=="true"?t=30:e=="false"&&(t=31),this.addToken(t)}isDigit(e){return"0"<=e&&e<="9"}isAlpha(e){return"a"<=e&&e<="z"||"A"<=e&&e<="Z"||e=="_"}isAlphaNumeric(e){return this.isAlpha(e)||this.isDigit(e)}error(e){throw new Error(`[Syntax error] ${e}`)}},s=class{accept(e){return e.visit(this)}},p=class extends s{constructor(e,t){super();this.operator=e;this.right=t}accept(e){return e.visitUnary(this)}},a=class extends s{constructor(e,t,r){super();this.left=e;this.operator=t;this.right=r}accept(e){return e.visitBinary(this)}},l=class extends s{constructor(e){super();this.value=e}accept(e){return e.visitIdentifier(this)}},T=class extends s{constructor(e){super();this.properties=e}accept(e){return e.visitObjectExpression(this)}},E=class extends s{constructor(e,t){super();this.key=e;this.value=t}accept(e){return e.visitProperty(this)}},d=class extends s{constructor(e){super();this.elements=e}accept(e){return e.visitArrayExpression(this)}},o=class extends s{constructor(e){super();this.value=e}accept(e){return e.visitLiteral(this)}},k=class extends s{constructor(e,t,r){super();this.condition=e;this.ifTrue=t;this.ifFalse=r}accept(e){return e.visitTernary(this)}},y=class extends s{constructor(e,t){super();this.left=e;this.right=t}accept(e){return e.visitNullishCoalescing(this)}},A=class extends s{constructor(e,t){super();this.object=e;this.property=t}accept(e){return e.visitMemberAccess(this)}},m=class extends s{constructor(e,t){super();this.object=e;this.property=t}accept(e){return e.visitComputedMemberAccess(this)}},b=class{constructor(e){this.tokens=e,this.current=0}consume(e,t){if(this.check(e))return this.advance();this.error(t)}match(...e){return this.check(...e)?this.advance():!1}check(...e){return this.isAtEnd()?!1:e.some(t=>t===this.tokens[this.current].type)}advance(){return this.isAtEnd()||this.current++,this.previous()}isAtEnd(){return this.peek().type==32}peek(){return this.tokens[this.current]}peekNext(){return this.isAtEnd()?null:this.tokens[this.current+1]}previous(){return this.tokens[this.current-1]}error(e){throw new Error(e)}},f=class extends b{expression(){return this.ternary()}ternary(){let e=this.nullishCoalescing();if(this.match(21)){let t=this.ternary();this.consume(10,"Expected : after ternary");let r=this.ternary();return new k(e,t,r)}return e}nullishCoalescing(){let e=this.logicalOr();for(;this.match(22);){let t=this.nullishCoalescing();return new y(e,t)}return e}logicalOr(){let e=this.logicalAnd();for(;this.match(24);){let t=this.previous(),r=this.logicalAnd();e=new a(e,t,r)}return e}logicalAnd(){let e=this.equality();for(;this.match(25);){let t=this.previous(),r=this.equality();e=new a(e,t,r)}return e}equality(){let e=this.comparison();for(;this.match(15,11,23);){let t=this.previous(),r=this.comparison();e=new a(e,t,r)}return e}comparison(){let e=this.addition();for(;this.match(16,17,18,19);){let t=this.previous(),r=this.addition();e=new a(e,t,r)}return e}addition(){let e=this.multiplication();for(;this.match(4,5);){let t=this.previous(),r=this.multiplication();e=new a(e,t,r)}return e}multiplication(){let e=this.unary();for(;this.match(6,7);){let t=this.previous(),r=this.unary();e=new a(e,t,r)}return e}unary(){if(this.match(14,4)){let e=this.previous(),t=this.unary();return new p(e,t)}return this.memberAccess()}memberAccess(){let e=this.primary();for(;this.match(3,12);)if(this.previous().type==3){let t=this.consume(26,"Expected property name");e=new A(e,t.lexeme)}else{let t=this.expression();this.consume(13,"Expected ] after property access"),e=new m(e,t)}return e}primary(){if(this.match(31))return new o(!1);if(this.match(30))return new o(!0);if(this.match(29))return new o(null);if(this.match(28))return new o(this.previous().literal);if(this.match(27))return new o(this.previous().literal);if(this.match(0)){let e=this.expression();return this.consume(1,"Expect ) after expression"),e}if(this.match(12))return this.array();if(this.match(8))return this.object();if(this.match(26))return new l(this.previous().lexeme);this.error("Expect expression")}array(){let e=[];if(!this.check(13))for(;!this.check(13)&&(e.push(this.expression()),!!this.match(2)););return this.consume(13,"Expect ] after array"),new d(e)}object(){let e=[];if(!this.check(9))for(;!this.check(9);){let t;this.match(26)?t=this.previous().lexeme:this.match(27)?t=this.previous().literal:this.error("Expect property name"),this.consume(10,"Expect : after property name");let r=this.expression();if(e.push(new E(t,r)),!this.match(2))break}return this.consume(9,"Expect } after object"),new T(e)}},v=class{constructor(e){this.lookup=e}run(e){let r=new u(e).scanTokens(),h=new f(r).expression();return this.visit(h)}visit(e){return e.accept(this)}visitBinary(e){let t=this.visit(e.left),r=this.visit(e.right);switch(e.operator.type){case 5:return t+r;case 4:return t-r;case 7:return t*r;case 6:return t/r;case 16:return t>r;case 17:return t>=r;case 18:return t<r;case 19:return t<=r;case 15:return t!=r;case 11:return t==r;case 25:return t&&r;case 24:return t||r;case 23:return this.search(t,r);default:throw new Error("Unknown operator: "+e.operator.lexeme)}}search(e,t){if(typeof e=="string"&&typeof t=="string")return e.indexOf(t)!=-1;if(typeof e=="number"&&typeof t=="number")return e%t==0;if(Array.isArray(e))return Array.isArray(t)?t.every(r=>e.indexOf(r)!==-1):e.indexOf(t)!==-1;throw new Error("Cannot search "+typeof t+" in "+typeof e)}visitArrayExpression(e){return e.elements.map(t=>this.visit(t))}visitLiteral(e){return e.value}visitIdentifier(e){return this.lookup(e.value)}visitNullishCoalescing(e){let t=this.visit(e.left);return t||this.visit(e.right)}visitObjectExpression(e){let t={};return e.properties.forEach(r=>{t[r.key]=this.visit(r.value)}),t}visitProperty(e){return this.visit(e.value)}visitUnary(e){let t=this.visit(e.right);switch(e.operator.type){case 4:return-t;case 14:return!t;default:throw new Error("Unknown operator: "+e.operator.lexeme)}}visitTernary(e){return this.visit(e.condition)?this.visit(e.ifTrue):this.visit(e.ifFalse)}visitComputedMemberAccess(e){let t=this.visit(e.object),r=this.visit(e.property);if(t!==void 0)return t[r]}visitMemberAccess(e){let t=this.visit(e.object),r=e.property;if(t!==void 0)return t[r]}},x=v;panel.plugin("rasteiner/whenquery",{use:[function(i){function e(t){let r=i.component(t);i.component(t,{extends:r,methods:{meetsCondition(n){return r.options.methods.meetsCondition.call(this,n)?n.whenQuery?new x(R=>this.$store.getters["content/values"]()[R]).run(n.whenQuery):!0:!1}}})}e("k-sections"),e("k-fieldset")}]});})();