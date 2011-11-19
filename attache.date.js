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

	// Public Function: format(Date d, String format) -> String
	//   Formats the given Date object according to the PHP
	// date format string. If d is not a Date, returns "".
	date.format = function(d, format) {
		if ( !(d instanceof Date ) ) return "";

		// if this is the first time we've seen this exact format,
		// compile and cache a custom formatting function.
		if ( !formatFunctions[format] ) {
			formatFunctions[format] = createFormatFunction(format);
		}

		return formatFunctions[format](d);
	}

	// writes the (very simple) code necessary to format a Date
	function createFormatFunction(format) {
		var pieces = [];
		
		for (var i = 0; i < format.length; ++i) {
			var ch = format.charAt(i);
			if (ch === "\\") {
				++i;
				ch = format.charAt(i);
				if ( ch ) pieces.push(quote(ch));
			} else {
				pieces.push( formatCodeForMaskCharacter(ch) );
			}
		}
		// joining an array of '' has two benefits: it automatically handles the empty
		// string case, and it coerces every piece to a string, avoid adding numbers.
		var code = "function(d){return [" + pieces.join(', ') + "].join('');}";
		return compile(code);
	}

	// returns the snippet of code for each formatting character.
	function formatCodeForMaskCharacter(character) {
		switch (character) {
		case "d": return "zpad(d.getDate(), 2)";
		case "D": return "date.dayNames[d.getDay()].substring(0, 3)";
		case "j": return "d.getDate()";
		case "l": return "date.dayNames[d.getDay()]";
		case "S": return "suffix(d)";
		case "w": return "d.getDay()";
		case "z": return "dayOfYear(d)";
		case "W": return "weekOfYear(d)";
		case "F": return "date.monthNames[d.getMonth()]";
		case "m": return "zpad(d.getMonth() + 1, 2)";
		case "M": return "date.monthNames[d.getMonth()].substring(0, 3)";
		case "n": return "(d.getMonth() + 1)";
		case "t": return "daysInMonth(d)";
		case "L": return "(isLeapYear(d) ? 1 : 0)";
		case "Y": return "d.getFullYear()";
		case "y": return "('' + d.getFullYear()).substring(2, 4)";
		case "a": return "(d.getHours() < 12 ? 'am' : 'pm')";
		case "A": return "(d.getHours() < 12 ? 'AM' : 'PM')";
		case "g": return "((d.getHours() %12) ? d.getHours() % 12 : 12)";
		case "G": return "d.getHours()";
		case "h": return "zpad((d.getHours() %12) ? d.getHours() % 12 : 12, 2)";
		case "H": return "zpad(d.getHours(), 2)";
		case "i": return "zpad(d.getMinutes(), 2)";
		case "s": return "zpad(d.getSeconds(), 2)";
		case "O": return "GMTOffset(d)";
		case "T": return "timezone(d)";
		case "Z": return "(d.getTimezoneOffset() * -60)";
		default: return quote(character); // embed the literal character.
		}
		// TODO: 
		// B, swatch internet time
		//   Math.floor((((d.getUTCHours() + 1)%24) + d.getUTCMinutes()/60 +  d.getUTCSeconds()/3600)*1000/24);
		//   or something like that.
		// r, RFC 2822
		//   date.format(d, 'D, j M Y H:i:s O')
		// I, 0 or 1 for daylightsavings time or not.
		// c, ISO 8601 date... example: 2004-02-12T15:19:21+00:00 (what's with the offset?)
		// U, seconds since epoch:
		//   Math.floor(this.getTime()/1000)
	}

	// Public Function: parse(String input, String format) -> Date
	//   Accepts a string and a PHP date mask and returns a Date
	// object if the input string can be interpretted as a Date 
	// according to the mask format.
	date.parse = function(input, format) {
		if ( !parseFunctions[format] ) {
			parseFunctions[format] = createParseFunction(format);
		}
		return parseFunctions[format](input);
	}

	// Writes a parse function that uses a regular expression to break a string
	// into matched groups, then uses generated code to build a Date object
	// from the resulting groups.
	function createParseFunction(format) {
		var regexNum = parseRegexes.length;
		var currentGroup = 1;

		var code = [
			"function(input){",
				"var h = -1, i = -1, s = -1;",
				"var d = new Date();",
				"var y = d.getFullYear();",
				"var m = d.getMonth();",
				"var d = d.getDate();",
				"var results = input.match(parseRegexes[" + regexNum + "]);",
				"if (results && results.length > 0) {"
		].join('');
		var regex = "";

		for (var i = 0; i < format.length; ++i) {
			var ch = format.charAt(i);
			if ( ch == "\\" ) {
				++i;
				ch = format.charAt(i);
				if ( ch ) regex += excapeRegex(ch);
			} else {
				var obj = maskCharacterToRegex(ch, currentGroup);
				if ( obj.g ) currentGroup += obj.g;
				regex += obj.s;
				if (obj.g && obj.c) {
					code += obj.c;
				}
			}
		}

		code += [
					"if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)",
						"{return new Date(y, m, d, h, i, s);}",
					"else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)",
						"{return new Date(y, m, d, h, i);}",
					"else if (y > 0 && m >= 0 && d > 0 && h >= 0)",
						"{return new Date(y, m, d, h);}",
					"else if (y > 0 && m >= 0 && d > 0)",
						"{return new Date(y, m, d);}",
					"else if (y > 0 && m >= 0)",
						"{return new Date(y, m);}",
					"else if (y > 0)",
						"{return new Date(y);}",
				"}",
				"return null;",
			"}"
		].join('');

		// we can avoid the expense of instantiating a
		// new regular expression each time the parse function
		// is called by moving it outside, in this case to
		// an expanding array of regular expression objects.
		parseRegexes[regexNum] = new RegExp("^" + regex + "$");
		return compile(code);
	}

	// for each possible mask, returns the regular expression
	// group necessary to match the corresponding piece of date
	// format and (optionally) the code necessary to interpret
	// that group.
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

	// returns the three-letter abbreviation for the local timezone, or return
	// an empty string if this can't be determined.  I've tested this in
	// Firefox, Chrome, Safari, and IE, and tried to make it reasonably robust,
	// but who knows if it will work in all browsers, all operating systems,
	// and internationally? 
	function timezone(d) {
		// look for a "(CDT)"-like pattern
		var match = (/\((\w+)\)/).exec(d+'');
		if ( match ) return match[1].toUpperCase();
		
		// look for a "(Central Daylight Time)"-like pattern
		match = (/\(((\w+ ?)+)\)/).exec(d+'');
		if ( match ) {
			var pieces = match[1].split(' ');
			return initials(pieces);
		}

		// for for a "Tue Jul 19 15:29:51 CDT 2011"-like pattern
		match = (/^\w+ \w+ \d+ \d+:\d+:\d+ (\w+) \d+$/).exec(d+'');
		if ( match ) return match[1].toUpperCase();

		return '';
	}

	function GMTOffset(d) {
		var tzo = d.getTimezoneOffset();
		return (tzo > 0 ? "-" : "+") + zpad(Math.floor(tzo / 60), 2) + zpad(tzo % 60, 2);
	}

	// returns the number of days since Jan 1 (between 0 and 364 for
	// normal years and between 0 and 365 for leap years.)
	function dayOfYear(d) {
		var num = 0;
		fluxDaysInMonth[1] = isLeapYear(d) ? 29 : 28;
		for (var i = 0; i < d.getMonth(); ++i) {
			num += fluxDaysInMonth[i];
		}
		return num + d.getDate() - 1;
	}

	// returns a two digit string from "00" to "53".
	function weekOfYear(d) {
		// Skip to Thursday of d week
		var now = dayOfYear(d) + (4 - d.getDay());
		// Find the first Thursday of the year
		var jan1 = new Date(d.getFullYear(), 0, 1);
		var then = (7 - jan1.getDay() + 4);
		return zpad(((now - then) / 7) + 1, 2);
	}

	function isLeapYear(d) {
		var year = d.getFullYear();
		return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
	}

	function daysInMonth(d) {
		fluxDaysInMonth[1] = isLeapYear(d) ? 29 : 28;
		return fluxDaysInMonth[d.getMonth()];
	}

	function suffix(d) {
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

	// *****  private helper functions  *****  

	// extract the first initial of a word
	function initials(words) { 
		var initials = "";
		for ( var i=0; i<words.length; i++ ) {
			initials += words[i].charAt(0).toUpperCase();
		}
		return initials;
	}

	// escape a string for use in a regular expression.  Any characters
	// which have special meaning in a regex will be escaped with a forward slash.
	function escapeRegex(pattern) {
		return String(pattern).replace(/[.*+?|()[\]{}\\^$]/g, "\\$&");
	}

	// quotes a string as a JavaScript single-quoted string literal.
	function quote(s) {
		return "'" + String(s).replace(/'/g, "\\'") + "'";
	}

	// left pad a number out with zeros.
	function zpad(val, size) {
		var result = String(val);
		while (result.length < size) {
			result = '0' + result;
		}
		return result;
	}

	// Private Function: compile(String code) -> Function
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
	date.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
	var fluxDaysInMonth = date.daysInMonth.slice();

	// data tables attached to date are public and exposed for
	// the user's convenience... but please don't modify them!
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
