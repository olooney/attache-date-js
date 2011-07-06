/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */

(function() { 

	window.attache = window.attache || {};
	var date = attache.date = attache.date || {};

	var parseFunctions = {};
	var parseRegexes = [];
	var formatFunctions = {};

	// TODO: don't expose these
	date.formatFunctions = formatFunctions;
	date.parseFunctions = parseFunctions;

	date.format = function(d, format) {
		if ( !formatFunctions[format] ) {
			formatFunctions[format] = createFormatFunction(format);
		}
		return formatFunctions[format](d);
	}

	function createFormatFunction(format) {
		var special = false;
		var ch = '';
		var pieces = [];
		
		// the function written by the below algorithm won't compile
		// with zero formatting pieces so just treat it as a special case.
		if ( format.length === 0 ) return function() { return ''; }

		for (var i = 0; i < format.length; ++i) {
			// TODO: instead of the special flag, we could just increment i
			ch = format.charAt(i);
			if (!special && ch == "\\") {
				special = true;
			}
			else if (special) {
				special = false;
				// TODO: shouldn't we escape a ' string, not a regex?
				pieces.push("'" + escapeRegex(ch) + "'");
			}
			else {
				pieces.push( formatCodeForMaskCharacter(ch) );
			}
		}
		// TODO: I worry that using the plus operator to concatinate strings
		// might add two numbers together... several of the below pieces do
		// return numbers!
		return compile("function(d){return " + pieces.join(' + ') + ";}");
	}

	function formatCodeForMaskCharacter(character) {
		switch (character) {
		case "d":
			return "zpad(d.getDate(), 2)";
		case "D":
			return "date.dayNames[d.getDay()].substring(0, 3)";
		case "j":
			return "d.getDate()";
		case "l":
			return "date.dayNames[d.getDay()]";
		case "S":
			return "get.suffix(d)";
		case "w":
			return "d.getDay()";
		case "z":
			return "get.dayOfYear(d)";
		case "W":
			return "get.weekOfYear(d)";
		case "F":
			return "date.monthNames[d.getMonth()]";
		case "m":
			return "zpad(d.getMonth() + 1, 2)";
		case "M":
			return "date.monthNames[d.getMonth()].substring(0, 3)";
		case "n":
			return "(d.getMonth() + 1)";
		case "t":
			return "get.daysInMonth(d)";
		case "L":
			return "(get.isLeapYear(d) ? 1 : 0)";
		case "Y":
			return "d.getFullYear()";
		case "y":
			return "('' + d.getFullYear()).substring(2, 4)";
		case "a":
			return "(d.getHours() < 12 ? 'am' : 'pm')";
		case "A":
			return "(d.getHours() < 12 ? 'AM' : 'PM')";
		case "g":
			return "((d.getHours() %12) ? d.getHours() % 12 : 12)";
		case "G":
			return "d.getHours()";
		case "h":
			return "zpad((d.getHours() %12) ? d.getHours() % 12 : 12, 2)";
		case "H":
			return "zpad(d.getHours(), 2)";
		case "i":
			return "zpad(d.getMinutes(), 2)";
		case "s":
			return "zpad(d.getSeconds(), 2)";
		case "O":
			return "get.GMTOffset(d)";
		case "T":
			return "get.timezone(d)";
		case "Z":
			return "(d.getTimezoneOffset() * -60)";
		default:
			return "'" + escapeRegex(character) + "'";
		}
	}

	// Function parse(String input, String format) -> Date
	//   Accepts a string and a PHP date mask and returns a Date
	// object if the input string can be interpretted as a Date 
	// according to the mask format.
	date.parse = function(input, format) {
		if ( !parseFunctions[format] ) {
			parseFunctions[format] = createParseFunction(format);
		}
		return parseFunctions[format](input);
	}

	function createParseFunction(format) {
		var regexNum = parseRegexes.length;
		var currentGroup = 1;

		var code = "function(input){\n"
			+ "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n"
			+ "var d = new Date();\n"
			+ "y = d.getFullYear();\n"
			+ "m = d.getMonth();\n"
			+ "d = d.getDate();\n"
			+ "var results = input.match(parseRegexes[" + regexNum + "]);\n"
			+ "if (results && results.length > 0) {"
		var regex = "";

		var special = false;
		var ch = '';
		for (var i = 0; i < format.length; ++i) {
			ch = format.charAt(i);
			if (!special && ch == "\\") {
				special = true;
			}
			else if (special) {
				special = false;
				regex += escapeRegex(ch);
			}
			else {
				var obj = maskCharacterToRegex(ch, currentGroup);
				if ( obj.g ) currentGroup += obj.g;
				regex += obj.s;
				if (obj.g && obj.c) {
					code += obj.c;
				}
			}
		}

		code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n"
			+ "{return new Date(y, m, d, h, i, s);}\n"
			+ "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n"
			+ "{return new Date(y, m, d, h, i);}\n"
			+ "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n"
			+ "{return new Date(y, m, d, h);}\n"
			+ "else if (y > 0 && m >= 0 && d > 0)\n"
			+ "{return new Date(y, m, d);}\n"
			+ "else if (y > 0 && m >= 0)\n"
			+ "{return new Date(y, m);}\n"
			+ "else if (y > 0)\n"
			+ "{return new Date(y);}\n"
			+ "}return null;}";

		parseRegexes[regexNum] = new RegExp("^" + regex + "$");
		return compile(code);
	}

	function maskCharacterToRegex(character, currentGroup) {
		switch (character) {
		case "D":
			return { s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)" };
		case "j":
		case "d":
			return {
				g:1,
				c:"d = parseInt(results[" + currentGroup + "], 10);\n",
				s:"(\\d{1,2})"
			};
		case "l":
			return { s:"(?:" + date.dayNames.join("|") + ")" };
		case "S":
			return { s:"(?:st|nd|rd|th)" };
		case "w":
			return { s:"\\d" };
		case "z":
			return { s:"(?:\\d{1,3})" };
		case "W":
			return { s:"(?:\\d{2})" };
		case "F":
			return {
				g:1,
				c:"m = parseInt(date.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
				s:"(" + date.monthNames.join("|") + ")"
			};
		case "M":
			return {
				g:1,
				c:"m = parseInt(date.monthNumbers[results[" + currentGroup + "]], 10);\n",
				s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
			};
		case "n":
		case "m":
			return {
				g:1,
				c:"m = parseInt(results[" + currentGroup + "], 10) - 1;\n",
				s:"(\\d{1,2})"
			};
		case "t":
			return { s:"\\d{1,2}"};
		case "L":
			return {
				s:"(?:1|0)"};
		case "Y":
			return {
				g:1,
				c:"y = parseInt(results[" + currentGroup + "], 10);\n",
				s:"(\\d{4})"
			};
		case "y":
			return {
				g:1,
				c:"var ty = parseInt(results[" + currentGroup + "], 10);\n"
					+ "y = ty > date.y2kYear ? 1900 + ty : 2000 + ty;\n",
				s:"(\\d{1,2})"
			};
		case "a":
			return {
				g:1,
				c:"if (results[" + currentGroup + "] == 'am') {\n"
					+ "if (h == 12) { h = 0; }\n"
					+ "} else { if (h < 12) { h += 12; }}",
				s:"(am|pm)"
			};
		case "A":
			return {
				g:1,
				c:"if (results[" + currentGroup + "] == 'AM') {\n"
					+ "if (h == 12) { h = 0; }\n"
					+ "} else { if (h < 12) { h += 12; }}",
				s:"(AM|PM)"
			};
		case "g":
		case "G":
		case "h":
		case "H":
			return {
				g:1,
				c:"h = parseInt(results[" + currentGroup + "], 10);\n",
				s:"(\\d{1,2})"
			};
		case "i":
			return {
				g:1,
				c:"i = parseInt(results[" + currentGroup + "], 10);\n",
				s:"(\\d{2})"
			};
		case "s":
			return {
				g:1,
				c:"s = parseInt(results[" + currentGroup + "], 10);\n",
				s:"(\\d{2})"
			};
		case "O":
			return { s:"[+-]\\d{4}" };
		case "T":
			return { s:"[A-Z]{3}" };
		case "Z":
			return { s:"[+-]\\d{1,5}" };
		default:
			return { s:escapeRegex(character)};
		}
	}

	// *****  helper functions to extract relevant pieces from date objects. *****
	var get = {
		timezone: function(d) {
			return d.toString().replace(
				/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(
				/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
		},

		GMTOffset: function(d) {
			var tzo = d.getTimezoneOffset();
			return (tzo > 0 ? "-" : "+") + zpad(Math.floor(tzo / 60), 2) + zpad(tzo % 60, 2);
		},

		dayOfYear: function(d) {
			var num = 0;
			date.daysInMonth[1] = get.isLeapYear(d) ? 29 : 28;
			for (var i = 0; i < d.getMonth(); ++i) {
				num += date.daysInMonth[i];
			}
			return num + d.getDate() - 1;
		},

		weekOfYear: function(d) {
			// Skip to Thursday of d week
			var now = get.dayOfYear(d) + (4 - d.getDay());
			// Find the first Thursday of the year
			var jan1 = new Date(d.getFullYear(), 0, 1);
			var then = (7 - jan1.getDay() + 4);
			document.write(then);
			return zpad(((now - then) / 7) + 1, 2);
		},

		isLeapYear: function(d) {
			var year = d.getFullYear();
			return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
		},

		daysInMonth: function(d) {
			date.daysInMonth[1] = get.isLeapYear(d) ? 29 : 28;
			return date.daysInMonth[d.getMonth()];
		},

		suffix: function(d) {
			switch (d.getDate()) {
				case 1:
				case 21:
				case 31:
					return "st";
				case 2:
				case 22:
					return "nd";
				case 3:
				case 23:
					return "rd";
				default:
					return "th";
			}
		}
	};

	// *****  private helper functions  *****  

	// escape a string for use in a regular expression.  Any characters
	// which have special meaning in a regex will be escaped with a forward slash.
	function escapeRegex(pattern) {
		return String(pattern).replace(/[.*+?|()[\]{}\\^$]/g, "\\$&");
	}

	// left pad a number out with zeros.
	function zpad(val, size) {
		var result = String(val);
		while (result.length < size) {
			result = '0' + result;
		}
		return result;
	}

	// Function compile(String code) -> Function
	//    uses eval() to create a function, in this lexical
	//  scope, and return it.  Those source code should
	//  include the full function declaration: 
	//    "function(x,y) { return x+y; }"
	function compile(code) {
		var f;
		eval('f = (' + code + ')');
		if ( typeof f !== 'function' ) {
			throw Error("couldn't compile \"" + code + "\" to a function.");
		}
		return f;
	}

	// *****  data tables  *****
	// TODO: make sure the public data structure doesn't flucuate in February.
	date.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
	date.monthNames =
	   ["January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	date.dayNames =
	   ["Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	date.y2kYear = 50;
	date.monthNumbers = {
		Jan:0,
		Feb:1,
		Mar:2,
		Apr:3,
		May:4,
		Jun:5,
		Jul:6,
		Aug:7,
		Sep:8,
		Oct:9,
		Nov:10,
		Dec:11
	};
	date.patterns = {
		ISO8601LongPattern:"Y-m-d H:i:s",
		ISO8601ShortPattern:"Y-m-d",
		ShortDatePattern: "n/j/Y",
		LongDatePattern: "l, F d, Y",
		FullDateTimePattern: "l, F d, Y g:i:s A",
		MonthDayPattern: "F d",
		ShortTimePattern: "g:i A",
		LongTimePattern: "g:i:s A",
		SortableDateTimePattern: "Y-m-d\\TH:i:s",
		UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
		YearMonthPattern: "F, Y"
	};

})();
