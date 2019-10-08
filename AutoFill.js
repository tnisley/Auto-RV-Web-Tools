/********************************
/   AUTOFILL
/
/	This script adds funcitonality to the ad entry page on the Auto & RV
/	web entry site and automates ad entry.
/	A button is placed beneath the textbox where the user pastes the ad text.
/	When clicked, the script parses the various fields and sets their values
/ 	on the page. Fields where user input is required are highlighted in red
/	to reduce page clutter and help user see what fields need to be entered.
/
/	The script also implements two needed features: validating that the user 
/	has set the ad date and allowing user to ignore the make and model fields
/	on items that have none.
/
/	Fields that AutoFill cannot currently handle are the vehicle color,
/	make, model, trim and vehicle type, although vehicle type may be implemented
/	in a future version.
*******************************/

/********************************
	CREATE THE BUTTON
********************************/

// Boder value used to highlight an element when user input is needed
var redOutline = "2px solid #ff0000";
//default outline on objects
var defaultOutline = "1px solid #ccc";

//Text box to get vehicle information from
var adText = document.getElementById("AdListing_AdText").value;

//add button to page
var myButton = document.createElement("BUTTON"); //create button element
myButton.innerHTML = "AutoFill"; // button label
myButton.type = "button"; //add button type
myButton.style = "margin: 10px 0px 10px 0px"; //add margin to button
myButton.id = "autoFillButton";

//place button on page
var elements = document.getElementsByClassName("listingAttribute webDescription");
elements[0].appendChild(myButton);

//Run the script when button is clicked
document.getElementById("autoFillButton").onclick = executeAutoFill;

/********************************
           AUTOFILL
********************************/

function executeAutoFill() {
	
	// Get the text to process
	var adText = document.getElementById("AdListing_AdText").value;
	
	//Parse the photo ID from adText
	var photoId;
	var photoIdResult = adText.match(/\#[A-Za-z]+\-\d+\-\d+/);
	if (photoIdResult)
		photoId = photoIdResult[0];
	
	// Set Ad Name
	if (photoId)
		setAdName(photoId);
	
	//activate and deactivate field to load pic
	document.getElementById("AdListing_AdName").focus();
	document.getElementById("AdListing_AdName").blur();
	
	// Parse category from photo ID
	var category = "";	
	if (photoId)
	{
		category = photoId.match(/[A-Za-z]+/)[0];
		category = category.toUpperCase();
	}
	
	//remove photo ID from remaining text
	// Avoids false positives for setStockNumber
	adText = adText.replace(photoId, "");
	
	// Set fields relevant to all categories
	setCategory(category);
	setYear(adText);
	setPrice(adText);
	setStockNum(adText);
	
	
	// Marketplace and Homes don't have make/model.
	// Turn of validation for make/model.
	if (category === "M" || category === "H" || category === "P")
		ignoreMakeModel();

	
	else
	{
		//Continue if not Marketplace/Homes/Parts and repairables.
		// They don't contain these fields.
		setMilesHrs(adText, category);
		setEngine(adText);
		setFuelType(adText, category);
		setTrans(adText);
		setDrivetrain(adText);
	}
	
	// highlight text boxes that user needs to fill in
	document.getElementById("AdListing_Make").style.border = redOutline;
	document.getElementById("AdListing_Model").style.border = redOutline;
	document.getElementById("AdListing_Trim").style.border = redOutline;
	document.getElementById("AdListing_ColorExterior").style.border = redOutline;
	document.getElementById("AdListing_VehicleType").style.border = redOutline;
	

	// check that user set the run date
	verifyDate();
	
}


/***************************
   AUTOFILL SUBROUTINES
***************************/

// Set the ad name. If no ad name, highlight the text field.
function setAdName(id) {
	var regEx = /\d+\-\d+/;
	var adName = regEx.exec(id);
	if (adName)
		document.getElementById("AdListing_AdName").value = adName;
	else
		document.getElementById("AdListing_AdName").style.border = redOutline;
}

// Set the category and trigger the event that fires when category is changed
// If no category or error, default to Automobiles and highlight text field
function setCategory(cat) {
	
	//dropdown menu
		
	//index of the dropdown menu item
	var menuItem = 0;
	
	switch (cat)
	{
		case "A":
		case "CV":
			menuItem = 0;
			break;
			
		case "T":
			menuItem = 1;
			break;
			
		case "CC":
			menuItem = 2;
			break;
			
		case "SUV":
			menuItem = 3;
			break;
			
		case "R":
			menuItem = 4;
			break;
			
		case "M":
			menuItem = 5;
			break;
			
		case "W":
			menuItem = 6;
			break;
			
		case "S":
			menuItem = 7;
			break;
			
		case "F":
			menuItem = 8;
			break;
			
		case "TT":
			menuItem = 9;
			break;
			
		case "B":
			menuItem = 10;
			break;
		
		case "E":
			menuItem = 11;
			break;
		
		case "P":
			menuItem = 12;
			break;
			
		case "H":
			menuItem = 13;
			break;
			
		case "X":
			menuItem = 14;
			break;
			
		// Category is invalid value
		default:
			menuItem = 0;
			document.getElementById("AdListing_Category").style.border = redOutline;
	}
	document.getElementById("AdListing_Category").options.selectedIndex = menuItem;
	// trigger event from category changing
	document.getElementById("AdListing_Category").dispatchEvent(new Event('change'));
}

// Set the year. If no year, set to N/A.
function setYear(text) {
	var regEx = /.+(?=\n)/m;
	var firstLine = regEx.exec(text); //get first line of text to find year
	if (!firstLine)                   // if only one line of text, search whole text
		firstLine = text;
	var yearRegEx = /19\d\d|20\d\d/;  //find year
	var year = yearRegEx.exec(firstLine);
	
	if (!year)                            // if no year, set to zero
		year = "0"
	document.getElementById("AdListing_AdYear").value = year[0];
}

// Sets the price. Handles most ways price can be worded.
// Igonores payments and downs. Handles most forms of "Was Now" pricing.
// If more than one price and price cannot be determined, field is left empty
// and is highligheted. If no price, sets  price to 0.
function setPrice(text) {
	
	// find price that is not a payment
	var searchResult = text.match(/\$\d*\,*\d\d\d(?!\/| down| per| week| bi| month)/g);
	var price = "";
	console.log(searchResult);

	// No price
	if (!searchResult)
	{
		price = "0";
	}
	
	// one price value
	else if (searchResult.length === 1)
	{
			price = searchResult[0];
			
			//remove '$' and ','
			price = price.replace("$", "");
			price = price.replace(",", "");
	}
	
	// more than one price value
	else 
		searchResult = text.match(/(?:now|sale|sale price|our price|only|now only) \$\d*\,*\d+/i)
		console.log(searchResult);
		if (searchResult != null && searchResult.length === 1)
		{
			price = searchResult[0];
			
			//remove text and spaces
			price = price.replace(/[A-Za-z]+/g, "");
			price = price.replace(/ /g, "");
		
			//remove '$' and ','
			price = price.replace("$", "");
			price = price.replace(",", "");
			
			console.log(price);
		}
	
	
	
	// If price is set, change the price element
	if (price != "")
		document.getElementById("AdListing_Price").value = price;
	
	else
		document.getElementById("AdListing_Price").style.border = redOutline;
}

// Sets the miles/hours depending on the vehicle's category if listed.
function setMilesHrs(text, cat) {
	
	var milesHrs = "";
	
	// Vehicles with hours
	if (cat.valueOf() == "W" || cat.valueOf() == "S" || 
		cat.valueOf() == "F" || cat.valueOf() == "E")
	{
		var searchResult = text.match(/\d*\,*\d+(?= (hr|hour))/i);
		if (searchResult)
		{
			milesHrs = searchResult[0];
			milesHrs = milesHrs.replace(",", "");
		}
	}
	
	// vehicles with miles
	else if (cat.valueOf() != "H" && cat.valueOf() != "X")
	{
		// get miles but not "xx,xxx mile warranty""
		var searchResult = text.match(/\d*\,*\d+(?= (mi\.|mile|low|1|one|actual mi|act\. mi))(?! (mi.|mile) (fact|warr))/i);
		if (searchResult)
		{
			milesHrs = searchResult[0];
			milesHrs = milesHrs.replace(",", "");
		}
	}
	
	if (milesHrs != "")
		document.getElementById("AdListing_MilesHours").value = milesHrs;
}

// Set engine size if listed.
function setEngine(text) {
	
	var engine = "";
	
	// Get engine value
	
	// 2 cylinder
	if (text.match(/2 cyl/i))
		engine = "2-Cylinder";
	
	// 3 cylinder
	if (text.match(/3 cyl/i))
		engine = "3-Cylinder";
	
	// 4 cylinder
	if (text.match(/4 cyl|i4(?!\d|\w)| i\-4/i))
		engine = "4-Cylinder";
	
	// 5 cylinder
	else if (text.match(/5 cyl|i5(?!\d|\w)| i\-5/i))
		engine = "5-Cylinder";
	
	// 6 cylinder
	else if (text.match(/6 cyl|v6|i6(?!\d|\w)/i))
		engine = "6-Cylinder";
	
	// 8 cylinder
	else if (text.match(/8 cyl|v8(?!\d|\w)/i))
		engine = "8-Cylinder";
	
	// 10 cylinder
	else if (text.match(/10 cyl|v10(?!\d|\w)/i))
		engine = "10-Cylinder";
	
	// 12 cylinder
	else if (text.match(/12 cyl|v12(?!\d|\w)/i))
		engine = "12-Cylinder";
	
	// Set engine value
	if (engine != "")
		document.getElementById("AdListing_Engine").value = engine;
}

// Set the fuel type if listed. Handles diesel, hybrid and gasoline.
function setFuelType(text, cat) {
	
	// diesel
	if (text.match(/diesel|duramax|power stroke|cummins|detroit|dt\-/i))
		document.getElementById("AdListing_FuelType").value = "Diesel";
	
	//hybrid
	// Handle hybrid first, as listing may contain both gas and hybrid.
	else if (text.match(/hybrid/i)) 
	{
		if (cat.valueOf() === "A" || cat.valueOf() === "T" || cat.valueOf() === "SUV")
			document.getElementById("AdListing_FuelType").value = "Hybrid";
	}
	
	// gas
	else if (text.match(/gas/i))
		document.getElementById("AdListing_FuelType").value = "Gasoline";
	
}

// Set Transmission if listed. Handles automatic, CVT and manual.
function setTrans(text) {
	
	// CVT -  checkfirst since ad can have both AT and CVT
	if (text.match(/CVT/))
		document.getElementById("AdListing_Transmission").value = "CVT";
	
	// Automatic
	else if (text.match(/ AT(?=\,|\.|\-)/) ||
			 text.match(/auto|automatic(?=\,|\.| trans)/i) ||
			 text.match(/^AT(?=\,|\.|\-)/))
		document.getElementById("AdListing_Transmission").value = "Automatic";
	
	// Manual trans.
	else if (text.match(/manual trans|sp\. manual/i))
		document.getElementById("AdListing_Transmission").value = "Manual";
		
}

// Set the drivetrain if listed.
function setDrivetrain(text) {
	
	// 4WD
	var textToFind = /(4x4|4wd)/i;
	if (text.search(textToFind) != -1) {
		document.getElementById("AdListing_DriveTrain").value = "4-Wheel Drive / 4x4";
		return true;
	}
	
	// AWD
	var textToFind = /(awd|all wheel drive)/i;
	if (text.search(textToFind) != -1) {
		document.getElementById("AdListing_DriveTrain").value = "AWD";
		return true;
	}
	
	// FWD
	var textToFind = /(fwd)/i;
	if (text.search(textToFind) != -1) {
		document.getElementById("AdListing_DriveTrain").value = "FWD";
		return true;
	}
	
	// RWD
	var textToFind = /(rwd)/i;
	if (text.search(textToFind) != -1) {
		document.getElementById("AdListing_DriveTrain").value = "RWD";
		return true;
	}
	
	// 2WD
	var textToFind = /(2wd|4x2)/i;
	if (text.search(textToFind) != -1) {
		document.getElementById("AdListing_DriveTrain").value = "2-Wheel Drive / 4x2";
		return true;
	}
	return false;
}

// Set stock number if listed. Remove the PhotoId before calling
// to prevent it from being flagged as the stock number.
function setStockNum(text) {
	var regEx = / \#[A-Za-z0-9]\S+/m;
	var stockNum = regEx.exec(text);
	if (stockNum) {
		stockNum[0] = stockNum[0].replace(/ \#/, "");              // remove # sign
		document.getElementById("AdListing_StockNumber").value = stockNum[0];
	}
}

// Checks if the user has set the ad date. User is alerted via pop-up 
// if date has not been set.
function verifyDate() {
	
	
	var startDate = document.getElementById("AdListing_RunStart").value;
	var endDate = document.getElementById("AdListing_RunStop").value;
	
	// Ad start date ad end date are equal by default. 
	// Use this to determine if date has been set.
	if (startDate === endDate)
		alert("Please set the start and end dates.");
}

// Some items don't have a make and/or model. This function turns
// of make/model validation.
function ignoreMakeModel() {
	document.getElementById("AdListing_IgnoreMakeModel").value = "1";
}
