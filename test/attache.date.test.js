(function() {
	module('attache.date');

	// TODO ah man, I hardcoded my timezone into the tests...

	test('format', function() {
		// arbitrary but consistent date to use for formatting tests
		var d = new Date(2011, 11 - 1, 21, 15, 32, 2);

		// test all the predefined patterns.
		equals( attache.date.format(d, "Y-m-d H:i:s"), "2011-11-21 15:32:02", "ISO8601LongPattern");
		equals( attache.date.format(d, "Y-m-d"), "2011-11-21", "ISO8601ShortPattern");
		equals( attache.date.format(d, "n/j/Y"), "11/21/2011", "ShortDatePattern");
		equals( attache.date.format(d, "l, F d, Y"), "Monday, November 21, 2011", "LongDatePattern");
		equals( attache.date.format(d, "l, F d, Y g:i:s A"), "Monday, November 21, 2011 3:32:02 PM", "FullDateTimePattern");
		equals( attache.date.format(d, "F d"), "November 21", "MonthDayPattern");
		equals( attache.date.format(d, "g:i A"), "3:32 PM", "ShortTimePattern");
		equals( attache.date.format(d, "g:i:s A"), "3:32:02 PM", "LongTimePattern");
		equals( attache.date.format(d, "Y-m-d\\TH:i:s"), "2011-11-21T15:32:02", "SortableDateTimePattern");
		equals( attache.date.format(d, "Y-m-d H:i:sO"), "2011-11-21 15:32:02-0600", "UniversalSortableDateTimePattern");
		equals( attache.date.format(d, "F, Y"), "November, 2011", "YearMonthPattern");

		// TODO: break this up into one test per character
		equals( attache.date.format(d, "d D j l S w z W F m M n t L Y y a A g G h H i s"), "21 Mon 21 Monday st 1 324 47 November 11 Nov 11 30 0 2011 11 pm PM 3 15 03 15 32 02", "main format characters");
		equals( attache.date.format(d, "O"), "-0600", "O, GMT offset");
		equals( attache.date.format(d, "T"), "CST", "T, timezone");
		equals( attache.date.format(d, "Z"), "-21600", "Z, timezone offset");

		// edge cases
		strictEqual( attache.date.format(d, ""), "", "empty string");
		equals( attache.date.format(d, "\\Y-\\m-\\d \\H:\\i:\\s"), "Y-m-d H:i:s", "escaping");

		// "jw" will be 22 instead of "211" if we don't ensure string concatination.
		strictEqual( attache.date.format(d, "j w"), "21 1");
		strictEqual( attache.date.format(d, "jw"), "211", "concatinate strings instead of adding numbers.");

		// zero padding, suffixes, leap year 
		var d2 = new Date(2004, 2 - 1, 3, 4, 5, 6);
		equals( attache.date.format(d2, "Y-m-d H:i:s"), "2004-02-03 04:05:06", "ISO8601LongPattern, zero padding");
		// TODO: break this up into one test per character
		equals( attache.date.format(d2, "d D j l S w z W F m M n t L Y y a A g G h H i s O T Z"), "03 Tue 3 Tuesday rd 2 33 05 February 02 Feb 2 29 1 2004 04 am AM 4 4 04 04 05 06 -0600 CST -21600", "all format characters");
	});

	test('parse', function() {
		// TODO: test all the other mask characters...
		var d = attache.date.parse("2011-11-21 15:32:02", "Y-m-d H:i:s");
		equals(d.getFullYear(), 2011, "year");
		equals(d.getMonth(), 10, "month"); // months start at 0
		equals(d.getDate(), 21, "date");
		equals(d.getHours(), 15, "hours");
		equals(d.getMinutes(), 32, "minutes");
		equals(d.getSeconds(), 2, "seconds");
	});
})();
