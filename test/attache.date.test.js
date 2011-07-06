(function() {
	module('attache.date');

	test('format', function() {
		// arbitrary but consistent date to use for formatting tests
		var d = new Date(2011, 10, 21, 15, 32, 2); // note: months start at 0

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

		// edge cases
		strictEqual( attache.date.format(d, ""), "", "empty string");
		equals( attache.date.format(d, "\\Y-\\m-\\d \\H:\\i:\\s"), "Y-m-d H:i:s", "escaping");

		// "jw" will be 22 instead of "211" if we don't ensure string concatination.
		strictEqual( attache.date.format(d, "j w"), "21 1");
		strictEqual( attache.date.format(d, "jw"), "211", "concatinate strings instead of adding numbers.");

	});
	test('parse', function() {
		var d = attache.date.parse("2011-11-21 15:32:02", "Y-m-d H:i:s");
		owlParsedDate  = d;
		console.log(d);
		equals(d.getFullYear(), 2011, "year");
		equals(d.getMonth(), 10, "month"); // months start at 0
		equals(d.getDate(), 21, "date");
		equals(d.getHours(), 15, "hours");
		equals(d.getMinutes(), 32, "minutes");
		equals(d.getSeconds(), 2, "seconds");
	});

})();
