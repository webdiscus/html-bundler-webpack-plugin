// use all abc variable names to simulate generation a variable with a name containing the `$` symbol
let a = 0;
let b = a++;
let c = b++;
let d = c++;
let e = d++;
let f = e++;
let g = f++;
let h = g++;
let i = h++;
let j = i++;
let k = j++;
let l = k++;
let m = l++;
let n = m++;
let o = n++;
let p = o++;
let q = p++;
let r = q++;
let s = r++;
let t = s++;
let u = t++;
let v = u++;
let w = v++;
let x = w++;
let y = x++;
let z = y++;
let $z = z++;

// the goal is to generate such JS code, which contains `$` symbol, e.g. in in variable names
// the `$` symbol will be replaced in the testing plugin function used in webpack config
let $str = `Count: ${n} $.`;

console.log($str, $z);
