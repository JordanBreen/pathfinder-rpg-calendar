const log = console.log.bind(document);
function func_log(class_name, func_name, params, args, note) {
	if(params.length != args.length)
		return;
	let str = class_name + '.' + func_name + '(';
	for(let i = 0; i < params.length; i++) {
		str += params[i] + ' = ' + args[i];
		str += (i == params.length-1) ? '' : ', ';
	}
	str += (') -> ') + (note ? note : '');
	log(str);
}
// GLOBAL CONSTANTS: //////////////////////////////
const STD = 0, 
	  PFD = 1, 
	  TYPE_COUNT = 2;
const SET = 0,
      ADJ = 1;
const YEAR_ID  = 0,
      MONTH_ID = 1,
	  WEEK_ID  = 2,
	  DAY_ID   = 3;
var   DAYS_IN_WEEK, 
	  DAYS_IN_YEAR,
	  MAX_DAYS_IN_MONTH,
	  MAX_WEEK_ROWS,
	  MONTHS_IN_YEAR;
var   GREGORIAN_MONTH_NAMES,
	  GREGORIAN_MONTH_CODES;
const CENTURY        = 100;
const ERA_ABBR       = [["BC","AD"], ["AR"]], 
	  ERA_FULL       = ["Anno Domini", "Absolam Reckoning"];
const ID_DELIM       = '-';
const CLASS_DELIM    = ' ';
const ASSIGNMENT         = '=';
// CLASS NAMES: /////////////////////////////////
class Class {
	static STD      		= 'std'; 	
	static PFD      		= 'pfd';
	static PREV     		= 'prev';
	static CURR     		= 'curr';
	static INVERT           = 'invert';
	static NEXT     		= 'next';
	static RELATIVE 		= [this.PREV, this.CURR, this.NEXT];
	static ACTIVE           = 'active';
	static TABLE_ACTIVE     = 'table-active';
	// Headers:
	static #H_MIN = 1;
	static #H_MAX = 6;
	static H     = function(value)             {return (value >= Class.#H_MIN && value <= Class.#H_MAX ? 'h' + value : null);}
	static HIDE  = function(breakpoint)        {return 'd'     + (typeof breakpoint === 'number' ? '-' + breakpoint : '-') + 'none';}
	static SHOW  = function(value, breakpoint) {return 'd'     + (typeof breakpoint === 'number' ? '-' + breakpoint : '-') + value;}
	static TABLE = function(options)           {return 'table' + (typeof options    === 'string' ? '-' + options : '');}
	static FLOAT = function(direction)         {return 'float' + (typeof direction  === 'string' ? '-' + direction : '');}
	static BTN   = function(options)           {return 'btn'   + (typeof options    === 'string' ? '-' + options : '');}
	static PANEL = function(options)           {return 'panel' + (typeof options    === 'string' ? '-' + options : '');}
	static TEXT  = function(options)           {return 'text'  + (typeof options    === 'string' ? '-' + options : '');}
}
/////////////////////////////////////////////////
class Counter {
	static #year_id    = 0;
	static #month_id   = 0;
	static #week_id    = 0;
	static #day_id     = 0;
	static #day_number = 0;
	static #week_row   = 0;
	static get new_year_id()    { return   (Counter.#year_id   )++; }
	static get new_month_id()   { return   (Counter.#month_id  )++; }
	static get new_week_id()    { return   (Counter.#week_id   )++; }
	static get new_day_id()     { return   (Counter.#day_id    )++; }
	static get new_day_number() { return ++(Counter.#day_number);   }
	static get new_week_row()   { return   (Counter.#week_row  )++; }
	static reset_year_id()      { Counter.#year_id    = 0; }
	static reset_month_id()     { Counter.#month_id   = 0; }
	static reset_week_id()      { Counter.#week_id    = 0; }
	static reset_day_id()       { Counter.#day_id     = 0; }
	static reset_day_number()   { Counter.#day_number = 0; }
	static reset_week_row()     { Counter.#week_row   = 0; }
}
/////////////////////////////////////////////////
// Quality of Life Functions ////////////////////
/////////////////////////////////////////////////
function is_iterable(value) {
  return Symbol.iterator in Object(value);
}
function new_element(type, ...attribute_objects) {
	let new_element = document.createElement(type);
	for (const attribute_object of attribute_objects)
		switch(attribute_object.type) {
			case('value')      : new_element.value     = attribute_object.value; break;
			case('inner_HTML') : new_element.innerHTML = attribute_object.value; break;
			default            : new_element.setAttribute(attribute_object.type, attribute_object.value); break;
		}
	return new_element;
}
Element.prototype.append_child = function(...children) {
	for (let child of children) 
		this.appendChild(child);
}
// CLASS MANIPULATORS: //
Element.prototype.show = function(value = "", breakpoint = null) { 
	this.classList.add(Class.SHOW(value, breakpoint));
	this.classList.remove(Class.HIDE(breakpoint));  
}
Element.prototype.hide = function(value = "", breakpoint = null) { 
	this.classList.remove(Class.SHOW(value, breakpoint));
	this.classList.add(Class.HIDE(breakpoint));
}
Element.prototype.activate_element = function() {
	this.classList.add(Class.ACTIVE);
}
Element.prototype.deactivate_element = function() {
	this.classList.remove(Class.ACTIVE);
}
Element.prototype.activate_table_element = function() {
	this.classList.add(Class.TABLE_ACTIVE);
}
Element.prototype.deactivate_table_element = function() {
	this.classList.remove(Class.TABLE_ACTIVE);
}

function ordinal_suffix_of(i) {
    let j = i % 10;
    let k = i % 100;
    if (j == 1 && k != 11) return "st";
    if (j == 2 && k != 12) return "nd";
    if (j == 3 && k != 13) return "rd";
    return "th";
}
/////////////////////////////////////////////////
// Calendar Classes /////////////////////////////
/////////////////////////////////////////////////
var calendar;

class Base {
	#calendar;
	#ids;
	constructor(calendar, prefix_ids, suffix_id) {
		this.#ids = [];
		if (prefix_ids !== null)
			for (const prefix_id of prefix_ids)
				this.#ids.push(prefix_id);
		if(typeof suffix_id !== 'undefined')
			this.#ids.push(suffix_id);
		this.#calendar = calendar;
	}
	// GETS //
	get calendar() 			{ return this.#calendar;      }
	get ids() 	     		{ return this.#ids;           }
	get year_id()       	{ return this.#ids[YEAR_ID];  }
	get month_id()      	{ return this.#ids[MONTH_ID]; }
	get week_id()       	{ return this.#ids[WEEK_ID];  }
	get day_id()        	{ return this.#ids[DAY_ID];   }
	get year()          	{ return this.#calendar.years[this.year_id]; }
	get month()         	{ return this.year.months[this.month_id];    }
	get next_month()    	{ return this.valid_month_id(this.#ids[MONTH_ID+1]) ? this.year.months[this.#ids[MONTH_ID+1]] : null; }
	get prev_month()    	{ return this.valid_month_id(this.#ids[MONTH_ID-1]) ? this.year.months[this.#ids[MONTH_ID-1]] : null; }
	get week()          	{ return this.month.weeks[this.week_id]; }
	get day()            	{ return this.week.days[this.day_id];    }
	set month_id(id)     	{ this.#ids[MONTH_ID] = (this.valid_month_id(id) ? id : this.month_id); }
	valid_month_id(id)  	{ return id >= 0 && id < Year.MONTH_COUNT; }
	update()            	{ throw new Error('Base.Subclass::update() not implemented'); }
	get id() 				{ throw new Error('Base.Subclass::get id() not implemented'); }
}
// DAY //////////////////////////////////////////
class Day extends Base {
	static NA     = -1;
	static DEF    =  1;
	#number;
	#type;
	#html_elements;
	#table_cell;
	#number_box;
	#number_text;
	constructor(calendar, ids) {
		super(calendar, ids, Counter.new_day_id);
		this.#number = Day.NA;
		this.#table_cell = new_element('td',
			{type: 'id', value: 'D-' + this.id}, 
			{type: 'class', value: 'day color border'}
		);
		this.#number_box = new_element('div',
			{type: 'class', value: 'day container-fluid'}
		);
		this.#number_text = new_element('span',
			{type: 'class', value: 'day h6'}
		);
		
		this.#table_cell.addEventListener  ('click', this.calendar.select_day, false);
		this.#number_box.addEventListener  ('click', this.calendar.select_day, false);
		this.#number_text.addEventListener ('click', this.calendar.select_day, false);
		
		this.#table_cell.day  = () => this;
		this.#number_box.day  = () => this;
		this.#number_text.day = () => this;
		
		this.#number_box.append_child(this.#number_text);
		this.#table_cell.append_child(this.#number_box);
		this.#html_elements = [
			this.#table_cell, 
			this.#number_box, 
			this.#number_text
		];
	}
	#update_html( ) {
		this.#number_text.innerHTML = (this.#number != Day.NA) ? this.#number : "";
		for(const html_element of this.#html_elements)
			html_element.classList.add(this.#type);
	}
	get number()      { return this.#number;      }
	get type()        { return this.#type;        }
	get table_cell()  { return this.#table_cell;  }
	get number_box()  { return this.#number_box;  }
	get number_text() { return this.#number_text; }
	set number(number){
		this.#number = number;
		this.#update_html();
	}
	set type(type) {
		this.#type = type;
		this.#update_html();
	}
	get id()     { return this.day_id; }
	get number() { return this.#number; }
}
// WEEK /////////////////////////////////////////
class Week extends Base {
	static DAY_COUNT = 7;
	static DEF       = 0;
	#days;
	#table_row;
	constructor(_calendar, _ids) {
		super(_calendar, _ids, Counter.new_week_id);
		this.#table_row = new_element('tr',
			{type: 'id', value: 'W-' + this.id},
			{type: 'name', value: 'week'},
			{type: 'class', value: 'week container-fluid'}
		);
		this.#new_days();
	}
	#new_days() {
		this.#days = [];
		for (let i = 0; i < Week.DAY_COUNT; i++) {
			this.#days[i] = (new Day(this.calendar, this.ids));
			this.#table_row.appendChild(this.#days[i].table_cell);
		}
		Counter.reset_day_id();
	}
	update(start, end) {
		if(typeof start !== 'undefined' && typeof end !== 'undefined') {
			for (let i = 0; i < start; i++)
				this.#days[i].type = Class.PREV;
			for (let i = start; i < end; i++) {
				this.#days[i].type = Class.CURR;
				this.#days[i].number = Counter.new_day_number;
			}
			for (let i = end; i < Week.DAY_COUNT ; i++)
				this.#days[i].type = Class.NEXT;
			this.#table_row.show('table_row');
		}
		else  { // DEFAULT: FILL WITH NULL VALUES
			for (let i = 0; i < Week.DAY_COUNT; i++)
				this.#days[i].type = Class.NEXT;
			this.#table_row.hide('table-row');
		}
	}
	get id() 	    { return this.week_id;    }
	get days() 	    { return this.#days;      }
	get table_row() { return this.#table_row; }
}
// MONTH ////////////////////////////////////////
class Month extends Base {
	static DEF = 0;
	static MAX_DAY_COUNT;
	static MAX_WEEK_ROWS;
	// fields:
	#name; 	
	#abbr; 	
	#code; 	
	#num_days; 
	#pron; 	
	#deity; 
	#season;
	#first_dow;
	#last_dow;
	#num_week_rows;
	// table elements:
	#rows;
	#table; 
	#thead; 
	#tbody; 
	#tfoot;
	// headers:
	#month_header;
	#day_headers;
	// texts:
	#month_texts;
	#day_texts;
	// date objects:
	#weeks;
	constructor(calendar, ids) {
		super(calendar, ids, Counter.new_month_id);
		this.#name     = this.#fetch('name');
		this.#abbr     = this.#fetch('abbr');
		this.#code     = this.#fetch('code');
		this.#num_days = this.#fetch('days');
		this.#pron     = this.#fetch('pron');
		this.#deity    = this.#fetch('deity');
		this.#season   = this.#fetch('season');
		this.#new_table();
		this.#new_weeks();
	}
	#new_weeks() {
		this.#weeks = [];
		for (let i = 0; i < Month.MAX_WEEK_ROWS; i++) {
			this.#weeks[i] = new Week(this.calendar, this.ids);
			this.#tbody.appendChild(this.#weeks[i].table_row);
		}
	}
	update() {
		Counter.reset_day_number();
		Counter.reset_week_row();
		this.#calc_num_week_rows();
		this.#weeks[0].update(this.#first_dow, Week.DAY_COUNT); 			// update the first week starting from 'first_dow'
		for (let i = 1; i < this.#num_week_rows - 1; i++) 					// update the middle weeks completely
			this.#weeks[i].update(0, Week.DAY_COUNT);						// ...
		this.#weeks[this.#num_week_rows - 1].update(0, this.#last_dow + 1);	// update the last week up to the 'last_dow'
		for (let i = this.#num_week_rows; i < Month.MAX_WEEK_ROWS; i++) {	// any remaining week rows up until MAX_WEEK_ROW (6)...
			this.#weeks[i].update();										// default update
			this.#weeks[i].table_row.hide('table_row');										// hide the week table_row
		}
	}
	#calc_num_week_rows() {
		this.#first_dow = this.year.day_of_week(this, 1);									// First: 'Day of Week'
		this.#last_dow  = this.year.day_of_week(this, this.#num_days);				   	 	// Last:  'Day of Week'
		const FWO = this.#first_dow;														// First: 'Week Offset'
		const LWO = Week.DAY_COUNT - this.#last_dow - 1;  									// Last:  'Week Offset'
		this.#num_week_rows = Math.ceil((this.#num_days + FWO + LWO) / Week.DAY_COUNT);    	// Week rows needed for days in month
	}
	#new_table() {
		this.#table = new_element('table',
			{type: 'id', value: 'M-' + this.id}, 
			{type: 'name', value: this.#name},
			{type: 'class', value: this.#season + ' table container-fluid'}
		);
		this.#new_thead();
		this.#new_tbody();
		this.#new_tfoot();
		this.#table.hide('table');
	}
	#new_thead() {
		this.#thead = new_element('thead',
			{type: 'class', value: this.season + ' month'}
		);
		this.#new_month_texts ( );
		this.#new_headers     ( );
		this.#new_rows        ( );
		this.#thead.append_child(...this.#rows);
		this.#table.append_child(this.#thead);
	}
	#new_headers() {
		this.#new_month_header ( );
		this.#new_day_headers  ( );
	}
	#new_month_header() {
		this.#month_header = new_element('th',
			{type: 'class', value: 'month'},
			{type: 'colspan', value: Week.DAY_COUNT}
		);
		this.#month_header.append_child(...this.#month_texts);
	}
	#new_day_headers() {
		this.#day_headers = [];
		for (let i = 0; i < Week.DAY_COUNT; i++) {
			const DOW = this.calendar.fetch('day', i, 'name');
			this.#day_headers[i] = new_element('th',
				{type: 'name', value: DOW},
				{type: 'class', value: this.#season + ' day invert color text-center h6'},
				{type: 'scope', value: 'col'},
				{type: 'inner_HTML', value: DOW}
			);
		}
	}
	#new_month_texts() {
		this.#month_texts = [ ];
		this.#month_texts[0] = new_element('span',
			{type: 'class', value: 'month h-5'}, 
			{type: 'inner_HTML', value: this.#name}
		);
	}
	#new_rows() {
		this.#rows = [
			new_element('tr', {type: 'class', value: 'month text-center'}),
			new_element('tr', {type: 'class', value: 'day text-center'})
		];
		this.#rows[0].append_child(this.#month_header);
		this.#rows[1].append_child(...this.#day_headers);
	}
	#new_tbody() {
		this.#tbody = new_element('tbody',
			{type: 'name', value: 'month'}, 
			{type: 'class', value: 'month'}
		);
		this.#table.append_child(this.#tbody);
	}
	#new_tfoot() {
		this.#tfoot = new_element ('tfoot',
			{type: 'name', value: 'month'},
			{type: 'class', value: 'month'}
		);
		this.#table.append_child(this.#tfoot);
	}
	#fetch(key) 	{return this.calendar.fetch('month', this.id, key);}
	get id() 		{return this.month_id;}
	get name() 		{return this.name;}
	get weeks() 	{return this.#weeks;}
	get code() 		{return this.#code;}
	get season() 	{return this.#season;}
	get num_days() 	{return this.#num_days;}
	get table()		{return this.#table;}
}
// YEAR /////////////////////////////////////////
class Year extends Base {
	static #DIV = 4; 
	static #MOD = 2700;
	static #FAC = 400;
	static #MIN = 1700;
	static #MAX = 2100;
	static DAY_COUNT;
	static MONTH_COUNT;
	static DEF = new Date().getFullYear();
	#years_into;
	#code;
	#quotient;
	#leap_year;
	#years;
	#months;
	#container;
	#subcontainers;
	#left_btn;
	#right_btn;
	#era_abbrs;
	#year_inputs;
	constructor(calendar) {
		super(calendar, null, Counter.new_year_id)
		this.#years = [[0,0],[0,0]];
		this.#container = new_element ('div',
			{type: 'id', value: 'Y-' + this.id}, 
			{type: 'name', value: 'year'}, 
			{type: 'class', value: 'year panel'}
		);
		this.#new_months();
		this.#new_buttons();
		this.#new_era_abbrs();
		this.#new_year_inputs();
		this.#new_subcontainers();
	}
	update(year_arg) {
		if(typeof year_arg === 'undefined')
			year_arg = [Year.DEF, STD];
		const YEAR = year_arg[0];
		const TYPE = year_arg[1];
		switch(TYPE) {
			case STD: 
				this.#years[STD][SET] = YEAR; 
				this.#years[PFD][SET] = YEAR + Year.#MOD;
				break;
			case PFD:
				this.#years[STD][SET] = YEAR - Year.#MOD;
				this.#years[PFD][SET] = YEAR;
				break;
			default: 
				throw 'Parameter year_type is unhandled';
		}
		this.#adjust_years();
		this.#calc_fields();
		this.#year_inputs[STD].value = Math.abs(this.#years[STD][SET]);
		this.#year_inputs[PFD].value = Math.abs(this.#years[PFD][SET]);
		for (let month of this.#months) 
			month.update();
	}
	#adjust_years() {
		this.#years[STD][ADJ] = this.#years[STD][SET];
		this.#years[PFD][ADJ] = this.#years[PFD][SET];
		if(this.#years[STD][ADJ] < Year.#MIN || this.#years[STD][ADJ] >= Year.#MAX) {
			this.#years[STD][ADJ] %= Year.#FAC;
			this.#years[STD][ADJ] += Year.#MIN;
			this.#years[PFD][ADJ]  = this.#years[STD][ADJ] + Year.#MOD;
		}
	}
	#calc_fields() {
		this.#years_into = Year.#years_into_century(this.#years[STD][ADJ]);
		this.#quotient   = Math.floor(this.#years_into/Year.#DIV);
		this.#code       = Year.#get_code(this.#years[STD][ADJ]);	
		this.#leap_year  = Year.#is_leap_year(this.#years[STD][ADJ]);
	}
	#new_months() {
		this.#months = [];
		for (let i = 0; i < Year.MONTH_COUNT; i++) 
			this.#months[i] = new Month(this.calendar, this.ids);
		this.#months[Month.DEF].table.show('table');
		Counter.reset_month_id();
	}
	day_of_week(month, day_number) {
		let out = 0;
		out += this.#quotient;
		out += day_number; 
		out += month.code;
		out += (month.id == 0 || month.id == 1) ? -1 : 0;
		out += this.#code;
		out += this.#years_into;
		out %= Week.DAY_COUNT;
		return out;
	}
	#new_buttons() {
		this.#left_btn  = new_element('button',
			{type:'class', value:'month btn btn-outline-primary float-start'}, 
			{type:'inner_HTML', value:'<i class="bi-chevron-left"></i>'}
		);
		this.#right_btn  = new_element('button',
			{type:'class', value:'month btn btn-outline-primary float-end'}, 
			{type:'inner_HTML', value:'<i class="bi-chevron-right"></i>'}
		);
		this.#left_btn.addEventListener('click', this.calendar.show_prev_month, false);
		this.#right_btn.addEventListener('click', this.calendar.show_next_month, false);
		this.#left_btn.year = this;
		this.#right_btn.year = this;
	}
	#new_era_abbrs() {
		this.#era_abbrs = [ ];
		this.#era_abbrs[STD] = new_element('label',
			{type: 'for', value: 'year_input_std'},
			{type: 'class', value: 'era std'},
			{type: 'inner_HTML', value: ERA_ABBR[STD][this.#years[STD][SET]<0?0:1]}
		);
		this.#era_abbrs[PFD] = new_element('label',
			{type: 'for', value: 'year_input_pfd'},
			{type: 'class', value: 'era pfd'}, 
			{type: 'inner_HTML', value: ERA_ABBR[PFD]}
		);
		this.#era_abbrs[STD].hide('block');
	}
	#new_year_inputs() {
		this.#year_inputs = [ ];
		this.#year_inputs[STD] = new_element('input',
			{type: 'id', value: 'year_input_std'},
			{type: 'class', value: 'year std'},
			{type: 'type', value: 'number'}
		);
		this.#year_inputs[PFD] = new_element('input',
			{type: 'id', value: 'year_input_pfd'},
			{type: 'class', value: 'year pfd'},
			{type: 'type', value: 'number'},
			{type: 'value', value: Math.abs(this.#years[PFD][SET])}
		);
		this.#year_inputs[STD].hide('block');
	}
	#new_subcontainers() {	
		this.#subcontainers = [
			new_element('div', 
				{type: 'class', value: 'month panel-heading'}
			),
			new_element('div', 
				{type: 'class', value: 'month panel-body'}
			)
		];
		this.#subcontainers[0].append_child(
			this.#left_btn, this.#right_btn, 
			this.#year_inputs[PFD], this.#era_abbrs[PFD],
			this.#year_inputs[STD], this.#era_abbrs[STD]
		);
		for (const month of this.#months)
			this.#subcontainers[1].append_child(month.table);
		for (const subcontainer of this.#subcontainers)
			this.#container.append_child(subcontainer);
	}
	// MATH METHODS: //
	static #years_into_century(year) { return year % CENTURY;                                    }
	static #subcentury_year(year)    { return year - Year.#years_into_century(year);             }
	static #century_year(year)       { return year - Year.#years_into_century(year) + CENTURY;   }
	static #subcentury(year)         { return Year.#subcentury_year(year) / CENTURY;             }  
	static #century(year)            { return Year.#century_year(year) / CENTURY;                }
	static #is_leap_year(year)       { return year % 4 === 0;                                    }
	static #get_code(year)           { return 6 - (Year.#subcentury_year(year) % this.#FAC) * 2; }
	get id() 						 { return this.year_id;    }
	get months() 					 { return this.#months;    }
	get container() 				 { return this.#container; }
	get years()        				 { return this.#years; }
}
// CALENDAR /////////////////////////////////////
class Calendar {
	static #DEF = 0;
	static #SEL = 1;
	#data;
	#days_data;
	#months_data;
	#seasons_data;
	#names;
	#selected;
	#container;
	//#display;
	#years
	constructor(data, name) {
		this.#selected  = new Base(this, [0,0,0,0]);
		this.#container = document.getElementById('calendar');
		this.#names = [ 
			'standard', 
			name
		];
		this.#data  = [ 
			data[this.#names[Calendar.#DEF]],
			data[this.#names[Calendar.#SEL]]
		];
		this.#init_variables();
		this.#years = [];
		this.#years[0] = new Year(this);
		this.#container.appendChild(this.#years[0].container);
		//this.#display = new Display();
		//this.#display.container.hide('block');
		//this.#container.appendChild(this.#display.date_section);
	}
	#init_variables() {
		this.#days_data = [
			this.#data[Calendar.#DEF]['days'],
			this.#data[Calendar.#SEL]['days']
		]
		this.#months_data = [
			this.#data[Calendar.#DEF]['months'],
			this.#data[Calendar.#SEL]['months']
		]
		this.#seasons_data = [
			this.#data[Calendar.#DEF]['seasons'],
			this.#data[Calendar.#SEL]['seasons']
		]
		Month.MAX_DAY_COUNT = 0;
		Month.MAX_WEEK_ROWS = 6; 
		Year.DAY_COUNT      = 0;
		Year.MONTH_COUNT    = 12;
		Week.DAY_COUNT      = 7;
		
		let target_data = this.#months_data[Calendar.#SEL];
		if(!this.#months_data[Calendar.#SEL][0]['days']) 
			target_data = this.#months_data[Calendar.#DEF];
		for (const month in target_data) {
			if (month.days > Month.MAX_DAY_COUNT)
				Month.MAX_DAY_COUNT = month.days;
			Year.DAY_COUNT += month.days;
		}
	}
	fetch (caller_name, index, key) {
		let target = null;
		for(let i = Calendar.#SEL; i >= Calendar.#DEF; i--) {
			switch(caller_name) {
				case(null):     target = this.#data         [i][index][key]; break;
				case('month'):  target = this.#months_data  [i][index][key]; break;
				case('day'):    target = this.#days_data    [i][index][key]; break;
				case('season'): target = this.#seasons_data [i][index][key]; break;
				default:        return null;
			}
			if(target) return target;
		}
		return 0;
	}
	select_day(event) {
		const NDE = event.target; 				 // New-Day Element
		const CAL = NDE.day.calendar;  			 // Calendar Object
		const ODE = CAL.selected.day.table_cell; // Old-Day Element
		if (NDE.classList.contains(CURR)) {
			NDE.activate_table_element();
			ODE.deactivate_table_element();
			CAL.selected = NDE.day.ids;
			//CAL.display.date(CAL.selected);
		}
	}
	// EVENT HANDLERS: //////////////////////////
	show_next_month(event) {
		const CAL  = event.target.year.calendar;
		const SEL  = CAL.selected;
		const NEXT = SEL.next_month
		if (NEXT.id != SEL.month_id) {
			SEL.day.table_cell.deactivate_table_element();
			SEL.month.table.hide('table');
			SEL.month_id = PREV.id;
			SEL.month.table.show('table');
			//CAL.display.clear();
		}
	}
	show_prev_month(event) {
		const CAL  = event.target.year.calendar;
		const SEL  = CAL.selected;
		const PREV = SEL.prev_month;
		if (PREV.id != SEL.month_id) {
			SEL.day.table_cell.deactivate_table_element();
			SEL.month.table.hide('table');
			SEL.month_id = PREV.id;
			SEL.month.table.show('table');
			//CAL.display.clear();
		}
	}
	update() {
		for(const year of this.#years)
			year.update();
	}
	get years() 	{ return this.#years;    }
	//get display() 	{ return this.#display;  }
	get selected() 	{ return this.#selected; }
	set selected(id){ this.#selected = id;   }
}
/////////////////////////////////////////////////
// Main Point of Entry from 'calendar.html' /////
/////////////////////////////////////////////////
function init_calendar(event) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === this.DONE && this.status === 200) {
			calendar = new Calendar(this.response, 'pathfinder');
			calendar.update();
		}
	};
	xhr.responseType = "json";
	xhr.open("POST", "./data/calendar.json", true);
	xhr.send(null);
}
document.addEventListener("onload", init_calendar());