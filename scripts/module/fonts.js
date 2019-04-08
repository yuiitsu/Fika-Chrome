// multi-language fonts metadata
const Fonts = {
	rtl:['ar','arc','dv', 'fa', 'ha', 'he','khw','ks','ku','ps','ur','yi'],
	cssPrefix:'font-',
	typeface:[
		{
			lang: ['zh','zh-cn','zh-tw'], // 囊括的语言
			script:'chinese',
			default: 0, // 默认的字体index, 如中文的默认为黑体
			fonts:[ // 字体的名字和相应的css class
				{ name:'黑体', class:'heiti' },
				{ name:'宋体', class:'songti' },
				{ name:'楷体', class:'kaiti'},
				{ name:'圆体', class:'yuanti'},
			]
		},
		{
			lang:['jp'],
			script:'japanese',
			default: 0,
			fonts:[
				{ name:'明朝体', class:'mincho'},
				{ name:'ゴシック体', class:'gothic'},
				{ name:'丸ゴシック体', class:'maru'},
			]
		},
		{
			lang:[ 'af', 'be', 'bg', 'ca', 'co', 'cs', 'cy', 'da', 'de', 'en', 'eo', 'es', 'et', 'eu', 'fi', 'fr', 'fy', 'ga', 'gl', 'hr', 'hu', 'id', 'ig', 'is', 'it', 'kk', 'ku', 'la', 'lb', 'lt', 'lv', 'mg', 'mk', 'mn', 'ms', 'mt', 'nl', 'no', 'ny', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'sv', 'sw', 'tg', 'tl', 'tr', 'uk', 'uz', 'vi', 'xh', 'yo', 'zu' ] , // 62
			script:'latin',
			default: 2,
			fonts:[
				{ name:'Arial', class:'arial'},
				{ name:'Courier', class:'courier'},
				{ name:'Georgia', class:'georgia'},
				{ name:'Merriweather', class:'merriweather'},
				{ name:'Open Sans', class:'openSans'},
				{ name:'Palatino', class:'palatino'},
			]
		},
		// other languages
		{
			lang: [],
			script:'others',
			default: 0,
			fonts:[
				{ name:'Arial', class:'arial'},
				{ name:'Times New Roman', class:'times'},
			]
		}
	]
};