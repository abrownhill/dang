import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autocomplete from './modules/autocomplete'

//  So what is the structure here?
//  $('# the store variable name')
//  The `$` is shorthand for `document.querySelector` - Not JQuery but Bling instead
//  https://gist.github.com/paulirish/12fb951a8b893a454b32
//  Then it's just selecting the ID that we pass in (using #)
autocomplete( $('#address'), $('#lat'), $('#lng') );
