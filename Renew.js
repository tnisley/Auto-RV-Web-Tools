/********************************
/	RENEW
/
/	This script adds a button and input field to the ad renewal page.
/	It is designed to be used in conjunction with the InDesign script
/ 	GetReruns, which gets the AdIds for all non new ads. Ad Ids are entered
/	in the text box separated by spaces (handled by GetReruns). 
/	When the button is clicked, the script will select all ads so the user
/	does not have to do so manually. A pop-up will alert the user of 
/	any ads that could not be found.


/********************************
	CREATE THE BUTTON
********************************/

//add button to page and apply styling
var myButton = document.createElement("BUTTON"); //create button element
myButton.innerHTML = "Select Vehicles"; // button label
myButton.type = "button"; //add button type
myButton.id = "selectVehiclesButton";
myButton.className = "controlButton green";
myButton.style.padding = "10px";
myButton.style.marginLeft = "30px";

// Create and style text input field
var myTextField = document.createElement("INPUT");
myTextField.setAttribute("type", "text");
myTextField.id = "idText";
myTextField.placeholder = "Paste vehicle IDs";
myTextField.style.padding = "10px";
myTextField.style.marginLeft = "20px";


// create div for the button and input
var myDiv = document.createElement("Div");
myDiv.className = "container searchControls";
myDiv.style.padding = "10px";
myDiv.appendChild(myButton);
myDiv.appendChild(myTextField);


// Place div on page
parentDiv = document.getElementsByClassName("resultsPage")[0];
parentDiv.insertBefore(myDiv, parentDiv.childNodes[7]);

//Adjust element's margin so myDiv is directly below it
document.getElementsByClassName("searchControls")[0].style.marginBottom = "0px";

//Run the script when button is clicked
document.getElementById("selectVehiclesButton").onclick = Renew;

/********************************
           RENEW
********************************/

function Renew() {

	//Get text from input field
	var input = document.getElementById("idText").value;
	
	// Clear the input field
	document.getElementById("idText").value = "";
	
	if (input != "")
	{
		// Parse Ad Ids
		var inputIds = input.split(" ");
		//console.log(inputIds);
		
		// Track Ids that aren't on page
		var notFound = "";
		
		// Loop through Ids and click the checkbox to select them
		for (i = 0; i < inputIds.length; i++)
		{
			// checkbox id is same as the ad ID
			var vehicleCheckBox = document.getElementById(inputIds[i]);
			
			if (vehicleCheckBox)
			{
				vehicleCheckBox.click();
				inputIds[i] = "0";
			}
			
			else
			{
				notFound += inputIds[i];
				notFound += "\n";
			}
		}
		
		// Alert user of ads that were not found.
		if (notFound != "")
			alert("Could not find:\n" + notFound);
		
	}
}
 
