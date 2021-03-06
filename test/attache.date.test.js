(function() {
	module('attache.date');

	// TODO ah man, I hardcoded my timezone into the tests...

	test('format', function() {
		// arbitrary but consistent date to use for formatting tests
		var d = new Date(2011, 11 - 1, 21, 15, 32, 2);

		// test all the predefined patterns.
		equal( attache.date.format(d, "Y-m-d H:i:s"), "2011-11-21 15:32:02", "ISO8601LongPattern");
		equal( attache.date.format(d, "Y-m-d"), "2011-11-21", "ISO8601ShortPattern");
		equal( attache.date.format(d, "n/j/Y"), "11/21/2011", "ShortDatePattern");
		equal( attache.date.format(d, "l, F d, Y"), "Monday, November 21, 2011", "LongDatePattern");
		equal( attache.date.format(d, "l, F d, Y g:i:s A"), "Monday, November 21, 2011 3:32:02 PM", "FullDateTimePattern");
		equal( attache.date.format(d, "F d"), "November 21", "MonthDayPattern");
		equal( attache.date.format(d, "g:i A"), "3:32 PM", "ShortTimePattern");
		equal( attache.date.format(d, "g:i:s A"), "3:32:02 PM", "LongTimePattern");
		equal( attache.date.format(d, "Y-m-d\\TH:i:s"), "2011-11-21T15:32:02", "SortableDateTimePattern");
		equal( attache.date.format(d, "Y-m-d H:i:sO"), "2011-11-21 15:32:02-0600", "UniversalSortableDateTimePattern");
		equal( attache.date.format(d, "F, Y"), "November, 2011", "YearMonthPattern");

		equal( attache.date.format(d, "d"), "21", "d, d, day 01-31" );
		equal( attache.date.format(d, "D"), "Mon", "D, day of week, first three" );
		equal( attache.date.format(d, "j"), "21", "j, day 1-31" );
		equal( attache.date.format(d, "l"), "Monday", "l, day of week" );
		equal( attache.date.format(d, "S"), "st", "S, ordinal suffix" );
		equal( attache.date.format(d, "w"), "1", "w, day of week 0-6" );
		equal( attache.date.format(d, "z"), "324", "z, day of the year, 0-364" );
		equal( attache.date.format(d, "W"), "47", "W, ISO week number" );
		equal( attache.date.format(d, "F"), "November", "F, month name" );
		equal( attache.date.format(d, "m"), "11", "m, month 01-12" );
		equal( attache.date.format(d, "M"), "Nov", "M, month, first three" );
		equal( attache.date.format(d, "n"), "11", "n, month 1-12" );
		equal( attache.date.format(d, "t"), "30", "t, days in month" );
		equal( attache.date.format(d, "L"), "0", "L, leap year, 0 or 1" );
		equal( attache.date.format(d, "Y"), "2011", "Y, 4 digit year" );
		equal( attache.date.format(d, "y"), "11", "y, 2 digit year" );
		equal( attache.date.format(d, "a"), "pm", "a, am/pm" );
		equal( attache.date.format(d, "A"), "PM", "A, AM/PM" );
		equal( attache.date.format(d, "g"), "3", "g, hours 1-12" );
		equal( attache.date.format(d, "G"), "15", "G, hours 0-23" );
		equal( attache.date.format(d, "h"), "03", "h, hours 01-12" );
		equal( attache.date.format(d, "H"), "15", "H, hours 00-23" );
		equal( attache.date.format(d, "i"), "32", "i, minutes 00-59" );
		equal( attache.date.format(d, "s"), "02", "s, seconds 00-59" );
		equal( attache.date.format(d, "O"), "-0600", "O, GMT offset");
		equal( attache.date.format(d, "T"), "CST", "T, timezone");
		equal( attache.date.format(d, "Z"), "-21600", "Z, timezone offset");
		equal( attache.date.format(d, "U"), "1321911122", "U, seconds since UNIX epoch");

		// edge cases
		strictEqual( attache.date.format(d, ""), "", "empty string");
		equal( attache.date.format(d, "\\Y-\\m-\\d \\H:\\i:\\s"), "Y-m-d H:i:s", "escaping");

		// "jw" will be 22 instead of "211" if we don't ensure string concatination.
		strictEqual( attache.date.format(d, "j w"), "21 1");
		strictEqual( attache.date.format(d, "jw"), "211", "concatinate strings instead of adding numbers.");

		// test for leading zeros, am, leap year, basically anything not exercised by the first date.
		var d2 = new Date(2004, 2 - 1, 3, 4, 5, 6);

		equal( attache.date.format(d2, "Y-m-d H:i:s"), "2004-02-03 04:05:06", "ISO8601LongPattern, zero padding");

		equal( attache.date.format(d2, "d"), "03", "d, d, day 01-31" );
		equal( attache.date.format(d2, "D"), "Tue", "D, day of week, first three" );
		equal( attache.date.format(d2, "j"), "3", "j, day 1-31" );
		equal( attache.date.format(d2, "l"), "Tuesday", "l, day of week" );
		equal( attache.date.format(d2, "S"), "rd", "S, ordinal suffix" );
		equal( attache.date.format(d2, "w"), "2", "w, day of week 0-6" );
		equal( attache.date.format(d2, "z"), "33", "z, day of the year, 0-364" );
		equal( attache.date.format(d2, "W"), "05", "W, ISO week number" );
		equal( attache.date.format(d2, "F"), "February", "F, month name" );
		equal( attache.date.format(d2, "m"), "02", "m, month 01-12" );
		equal( attache.date.format(d2, "M"), "Feb", "M, month, first three" );
		equal( attache.date.format(d2, "n"), "2", "n, month 1-12" );
		equal( attache.date.format(d2, "t"), "29", "t, days in month" );
		equal( attache.date.format(d2, "L"), "1", "L, leap year, 0 or 1" );
		equal( attache.date.format(d2, "Y"), "2004", "Y, 4 digit year" );
		equal( attache.date.format(d2, "y"), "04", "y, 2 digit year" );
		equal( attache.date.format(d2, "a"), "am", "a, am/pm" );
		equal( attache.date.format(d2, "A"), "AM", "A, AM/PM" );
		equal( attache.date.format(d2, "g"), "4", "g, hours 1-12" );
		equal( attache.date.format(d2, "G"), "4", "G, hours 0-23" );
		equal( attache.date.format(d2, "h"), "04", "h, hours 01-12" );
		equal( attache.date.format(d2, "H"), "04", "H, hours 00-23" );
		equal( attache.date.format(d2, "i"), "05", "i, minutes 00-59" );
		equal( attache.date.format(d2, "s"), "06", "s, seconds 00-59" );
		equal( attache.date.format(d2, "O"), "-0600", "O, GMT offset");
		equal( attache.date.format(d2, "T"), "CST", "T, timezone");
		equal( attache.date.format(d2, "Z"), "-21600", "Z, timezone offset");
	});

	test('parse', function() {
		// TODO: test all the other mask characters...
		var d = attache.date.parse("2011-11-21 15:32:02", "Y-m-d H:i:s");
		equal(d.getFullYear(), 2011, "year");
		equal(d.getMonth(), 10, "month"); // months start at 0
		equal(d.getDate(), 21, "date");
		equal(d.getHours(), 15, "hours");
		equal(d.getMinutes(), 32, "minutes");
		equal(d.getSeconds(), 2, "seconds");

		var d2 = attache.date.parse("9/9/2009 3:09 PM", "n/j/Y g:i A");
		equal(d2.getFullYear(), 2009, "year");
		equal(d2.getMonth(), 8, "month"); // months start at 0
		equal(d2.getDate(), 9, "date");
		equal(d2.getHours(), 15, "hours");
		equal(d2.getMinutes(), 9, "minutes");
		equal(d2.getSeconds(), 0, "seconds");

		// date defaults to today, time defaults to midnight
		var d3 = attache.date.parse("", "");
		var now = new Date();
		equal(d3.getFullYear(), now.getFullYear(), "year");
		equal(d3.getMonth(), now.getMonth(), "month");
		equal(d3.getDate(), now.getDate(), "date");
		equal(d3.getHours(), 0, "hours");
		equal(d3.getMinutes(), 0, "minutes");
		equal(d3.getSeconds(), 0, "seconds");

		var d4 = attache.date.parse("1321911122", "U");
		equal(d4.getTime(), 1321911122000);

	});
})();
