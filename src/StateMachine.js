import { insertData, searchData, insertStateData, insertChatHistory, insertBusinessStage, insertService, insertSignedUp, insertLicences, insertProducts, insertNote, insertEventVenue } from "./dynamoService";


export default function StateMachine() {

    document.addEventListener("readystatechange", function (event) {
        if (document.readyState === 'complete') {

            let user = Number(localStorage.getItem("userId"));
            let serviceSelected = localStorage.getItem("serviceSelected");
            let eventVenue;


            //data needed to create timestamp for when it was created
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            today = dd + '/' + mm + '/' + yyyy;


            document.getElementById("chef").addEventListener("click", () => {
                const helpText = document.querySelector(".help-text");
                helpText.style.animation = "moveTextUp 3s linear infinite"; // Restart infinite animation if clicked
            });

            const chatCircle = document.getElementById("chat-circle");
            const chatBox = document.querySelector(".chat-box");
            const chatBoxToggle = document.querySelector(".chat-box-toggle");


            // Clear chat history
            const clearHistoryButton = document.getElementById("clearHistoryButton");
            clearHistoryButton.addEventListener("click", () => {

                localStorage.removeItem("userId");
                localStorage.removeItem("chatHistory");
                localStorage.removeItem("serviceSelected");
                localStorage.removeItem("currentState");

                user = null;
                serviceSelected = null;
                eventVenue = null;

                messagesContainer.innerHTML = "";
                statemachine.currentState = "start";
                statemachine.render();
            });


            // Show/Hide chat box
            chatCircle.addEventListener("click", () => {
                chatCircle.classList.add("hidden");
                chatBox.classList.add("show");

            });

            chatBoxToggle.addEventListener("click", () => {
                chatBox.classList.remove("show");
                chatCircle.classList.remove("hidden");
            });


            // Handle form submission
            const chatForm = document.getElementById("chat-form");
            const chatInput = document.getElementById("chat-input");
            const chatLogs = document.querySelector(".chat-logs");
            const messagesContainer = document.getElementById("messages");


            var statemachine = {
                currentState: "", // Initialize the current state
                selectedService: "", // Initialize the selected service
                states: {}, // Initialize the states object
                interact: function () { }, // Initialize the interact function
                render: function (isLoadingHistory = false) { } // Initialize the render function
            }


            // Define the states and their transitions
            statemachine.states = {
                "start": {
                    "message": "Welcome to the Stir Food Chatbot! Is it your first time here?",
                    "options": [
                        {
                            "title": "Yes, it is my first time",
                            "next": "services"
                        },
                        {
                            "title": "No, I've been here before",
                            "next": "Previous Conversation"
                        },
                    ]
                },

                "Previous Conversation": {
                    "message": "Welcome back! How can we assist you today?",
                    "options": [
                        {
                            "title": "Submit",
                            "type": "form", // Indicate that this option is a form
                            "fields": [ // Define the fields for the form
                                { name: "email", placeholder: "Email" },
                            ],
                            "callback": async function (data) { // Define the callback function for form submission
                                let email = data.email
                                let result = await searchData({ email });

                                if (result.success) {
                                    localStorage.setItem("userId", result.id);
                                    localStorage.setItem("serviceSelected", result.service)
                                    user = result.id;
                                    if (result.stateChat == "" || result.stateChat == undefined) {
                                        statemachine.currentState = "First Step";
                                        localStorage.setItem("currentState", "First Step");
                                        saveCurrentState();
                                        statemachine.render(); // Render the new state
                                    } else {
                                        statemachine.currentState = result.stateChat; // ex. state - Replace with different state after data base check
                                        localStorage.setItem("currentState", statemachine.currentState);
                                        loadChatFromDB(email);
                                        statemachine.render(true);
                                    }
                                }
                                else {
                                    statemachine.currentState = 'Unregistered'; // ex. state - Replace with different state after data base check
                                    statemachine.render(); // Render the new state
                                }
                            }
                        },

                        {
                            "title": "Back",
                            "back": "start"
                        }
                    ],
                },

                "Unregistered": {
                    "message": "The email or phone number you provided is not in our system. Please try again or start a new conversation",
                    "options": [
                        {
                            "title": "Try Again",
                            "next": "Previous Conversation"
                        },
                        {
                            "title": "Start New Conversation",
                            "next": "services"
                        }
                    ],
                },

                "services": {
                    "message": "What type of service are you looking for?",
                    "options": [
                        {
                            "title": "Warehouse Space",
                            "next": "Contact Form",
                            "service": "warehouseSpace"
                        },
                        {
                            "title": "Kitchen Rental",
                            "next": "Contact Form",
                            "service": "kitchenRental"
                        },
                        {
                            "title": "Event Venue",
                            "next": "Event Venue",
                            "service": "Event Venue"
                        },
                        {
                            "title": "Business Coach",
                            "next": "Contact Form",
                            "service": "Business Coach"
                        },
                        {
                            "title": "Ecommerce",
                            "next": "Contact Form",
                            "service": "Ecommerce"
                        },
                        {
                            "title": "Explain Each Service",
                            "next": "Explain"
                        }
                    ]
                },

                "Explain": {
                    "message": "Here is a brief explanation of each service we offer <br> <br> warehouse Space: A space for you to work on your projects <br> Kitchen Rental: A kitchen space for you to rent <br> Event Venue: A venue for hosting events <br> Business Coach: A coach to help you with your business <br> Ecommerce: An online platform for selling products",
                    "options": [
                        {
                            "title": "Back to Services",
                            "back": "services"
                        },
                    ]
                },

                "First Step": {
                    "message": "The first step to this process is signing up for The Food Corridor",
                    "options": [
                        {
                            "title": "Next Step",
                            "next": "Check Signed Up"
                        },
                        {
                            "title": "Sign up for the Food Corridor here",
                            "href": "https://app.thefoodcorridor.com/en/signup?default_kitchen=21957"
                        },
                        {
                            "title": "Back",
                            "back": "services"
                        }
                    ]
                },


                "Event Venue": {
                    "message": "Event Venues are available in the following types. Please select the type of venue you are looking for",
                    "options": [
                        {
                            "type": "combined-form",
                            "elements": [
                                {
                                    "type": "radio",
                                    "name": "venue_location",  // First radio button group for location
                                    "label": "Venue Location:",  // Label for the radio button group
                                    "boxes": [
                                        { name: "venue_location", value: "Indoor", id: "Indoor", label: "Indoor Venue" },
                                        { name: "venue_location", value: "Outdoor", id: "Outdoor", label: "Outdoor Venue" }
                                    ]
                                },
                                {
                                    "type": "radio",
                                    "name": "venue_capacity",  // Second radio button group for capacity
                                    "label": "Venue Capacity:",  // Label for the radio button group
                                    "boxes": [
                                        { name: "venue_capacity", value: "0-50", id: "small", label: "0-50 People" },
                                        { name: "venue_capacity", value: "50-100", id: "medium", label: "50-100 People" },
                                        { name: "venue_capacity", value: "100-150", id: "large", label: "100-150 People" }
                                    ]
                                }
                            ],
                            "callback": async function (data) {
                                if (data.venue_capacity != undefined && data.venue_location != undefined) {
                                    statemachine.currentState = "Contact Form";
                                    eventVenue = JSON.stringify({ venue_location: data.venue_location, venue_capacity: data.venue_capacity });
                                } else {
                                    statemachine.currentState = "Event Venue";
                                }
                                statemachine.render();
                            }
                        }
                    ]
                },


                "Check Signed Up": {
                    "message": "Are you already signed up for The Food Corridor?",
                    "options": [
                        {
                            /*Database update here with callback function similar way like above where the form is*/
                            "title": "Yes",
                            "next": "BusinessStage"
                        },
                        {
                            "title": "No",
                            "next": "Not Signed up"
                        }
                    ]
                },

                "Not Signed up": {
                    "message": "You need to sign up for The Food Corridor to proceed",
                    "options": [
                        {
                            "title": "Press Here to Sign Up",
                            "href": "https://app.thefoodcorridor.com/en/signup?default_kitchen=21957"
                        },
                        {
                            "title": "Back",
                            "back": "Check Signed Up"
                        }
                    ]
                },


                "Contact Form": {
                    "message": "Before moving onto the second phase, please fill out the form below so we can keep track of this conversation",
                    "options": [
                        {
                            "type": "form",
                            "fields": [
                                { name: "f_name", placeholder: "First Name" },
                                { name: "l_name", placeholder: "Last Name" },
                                { name: "b_name", placeholder: "Business Name" },
                                { name: "email", placeholder: "Email" },
                                { name: "phone", placeholder: "Phone" },
                                { name: "message", placeholder: "Message" }
                            ],
                            "callback": async function (data) {
                                let f_name = data.f_name;
                                let l_name = data.l_name;
                                let b_name = data.b_name;
                                let email = data.email;
                                let phone = data.phone;
                                let message = data.message;


                                let response = await insertData({ f_name, l_name, b_name, email, phone, message, today });
                                if (response.success) console.log("User data was inserted");


                                localStorage.setItem("userId", response.userId);
                                console.log(response.userId);
                                user = response.userId;
                                statemachine.currentState = "First Step"; // ex. state - Replace with different state after data base check
                                saveCurrentState();


                                let result = await insertService({ userId: user, service: serviceSelected });
                                console.log(result.message)

                                if (eventVenue != null) {
                                    result = await insertEventVenue({ userId: user, venue: eventVenue })
                                    console.log(result.message);
                                }


                                statemachine.render(); // Render the new state
                            }
                        },
                        {
                            "title": "Back",
                            "back": "start"
                        }
                    ]
                },

                "BusinessStage": {
                    "message": "What stage is your business are you in?",
                    "options": [
                        {
                            "type": "radio",
                            "label": "Business Stage:",
                            "boxes": [
                                { name: "business_stage", value: "Brand New", id: "brand_new", label: "Brand New (concept phase, no sales)" },
                                { name: "business_stage", value: "Getting Started", id: "getting_started", label: "Getting Started (some sales, have most legal docs)" },
                                { name: "business_stage", value: "Up N Running", id: "up_n_running", label: "Up N Running (selling, have legal docs)" },
                                { name: "business_stage", value: "Established", id: "established", label: "Established (selling, have legal docs)" },
                                { name: "business_stage", value: "Other", id: "other", label: "Other (not a food business)" }
                            ],
                            "callback": async function (data) {
                                if (data.selectedValue === "Brand New") {
                                    statemachine.currentState = "information";
                                } else if (data.selectedValue === "Getting Started") {
                                    statemachine.currentState = "Second Phase";
                                } else if (data.selectedValue === "Up N Running") {
                                    statemachine.currentState = "Second Phase";
                                } else if (data.selectedValue === "Established") {
                                    statemachine.currentState = "Second Phase";
                                } else if (data.selectedValue === "Other") {
                                    statemachine.currentState = "information";
                                }

                                console.log(user);
                                let result = await insertBusinessStage({ userId: user, businessStage: data.selectedValue });
                                if (data.selectedValue != "Brand New") {
                                    saveCurrentState(statemachine.currentState);
                                }
                                if (result.success) console.log(result.message);


                                statemachine.render();
                            }
                        }
                    ]
                },


                "Second Phase": {
                    "message": "Great! Let's check the pre-rental checklist of what you have",
                    "options": [
                        {
                            "type": "checkbox",
                            "boxes": function () {
                                let sel = localStorage.getItem("serviceSelected");

                                if(sel == "Warehouse Space") statemachine.selectedService = "warehouseSpace";
                                else if(sel == "Kitchen Rental") statemachine.selectedService = "kitchenRental";
                                else if(sel == "Event Venue") statemachine.selectedService = "Event Venue";
                                else if(sel == "Business Coach") statemachine.selectedService = "Business Coach";
                                let result = getCheckboxesForService(statemachine.selectedService);
                                //console.log(result);
                                return result;
                            }
                        }
                    ]
                },

                "defaultState": {
                    "message": "All requirements are met. You can proceed to the next step",
                    "options": [
                        {
                            "title": "Food Processing",
                            "next": "Food Processing",
                            "service": "Food Processing",
                        },
                        {
                            "title": "Food Service",
                            "next": "Food Service",
                            "service": "Food Service",
                        }
                    ]
                },

                "Food Service": {
                    "message": "Please contact our support team directly for further assistance",
                    "options": [
                        {
                            "title": "Next Step",
                            "back": "Food Form"
                        }]
                },

                "Food Processing": {
                    "message": "Please contact our support team directly for further assistance",
                    "options": [
                        {
                            "title": "Next Step",
                            "back": "Food Form"
                        }]
                },


                "Food Form": {
                    "message": "Please fill out the form below so we can keep track of this conversation",
                    "options": [
                        {
                            "type": "combined-form",
                            "elements": [
                                {
                                    "type": "checkbox-group",
                                    "name": "Types of Products",
                                    "boxes": [
                                        { name: "food_docs", value: "Processed & Packaged Foods 🍽️", id: "Processed & Packaged Foods" },
                                        { name: "food_docs", value: "Dairy, Meat & Seafood 🥩🥚🐟", id: "Dairy, Meat & Seafood" },
                                        { name: "food_docs", value: "Ingredients & Seasonings 🌿🥫", id: "Ingredients & Seasonings" },
                                        { name: "food_docs", value: "Speciality & Agricultural Products 🌱🚜", id: "Speciality & Agricultural Products" },
                                        { name: "food_docs", value: "Other Products 🏷️", id: "Other" }
                                    ]
                                },
                                {
                                    "type": "radio",
                                    "name": "Space/Time Needed",
                                    "label": "Space/Time Needed:",  // Label for the radio button group
                                    "boxes": [
                                        { name: "business_type", value: "0-10", id: "0-10", label: "0-10 Hours" },
                                        { name: "business_type", value: "10-25", id: "10-25", label: "10-25 Hours" },
                                        { name: "business_type", value: "25-50", id: "25-50", label: "25-50 Hours" }
                                    ]
                                },
                                {
                                    "type": "textarea",
                                    "name": "notes",
                                    "label": "Additional Notes",
                                    "placeholder": "Please enter any additional notes or requirements..."
                                }
                            ],
                            "callback": async function (data) {
                                console.log("Form data:", data);

                                let result = await insertProducts({ userId: user, products: JSON.stringify(data.foodDocs) });
                                console.log(result.message);

                                result = await insertNote({ userId: user, note: JSON.stringify(data.notes) });
                                console.log(result.message);

                                if (data.businessType === "Food Processing") {
                                    statemachine.currentState = "Food Processing";
                                } else if (data.businessType === "Food Service") {
                                    statemachine.currentState = "Food Service";
                                } else {
                                    statemachine.currentState = "information";
                                }
                                statemachine.render();
                            }
                        },
                        {
                            "title": "Back",
                            "back": "start"
                        }
                    ]
                },


                // Then update the handleUnchecked state to use this function:
                "handleUnchecked": {
                    "message": "Please read the following requirement",  // Remove message from here
                    "render": function (uncheckedItems) {
                        return handleUncheckedItems(uncheckedItems);
                    },
                    "options  ": []
                },
            };


            // Function to handle user interaction
            statemachine.interact = async function (option) {
                var currentState = statemachine.states[statemachine.currentState]; // Get the current state
                var selectedOption = currentState.options[option]; // Get the selected option

                const lastMsgDiv = messagesContainer.lastElementChild;
                if (lastMsgDiv && lastMsgDiv.classList.contains("chat-msg")) {
                    const msgTextDiv = lastMsgDiv.querySelector(".cm-msg-text");
                    if (msgTextDiv) {
                        // Create a new message div for the reply
                        const replyMsgDiv = document.createElement("div");
                        replyMsgDiv.className = "chat-msg self"; // You can adjust the class as per your design

                        // Set the content of the new message box
                        replyMsgDiv.innerHTML = `<div class="cm-msg-text-reply">${selectedOption.title}</div>`;

                        // Append the new message box to the container
                        messagesContainer.appendChild(replyMsgDiv);
                        chatLogs.scrollTop = chatLogs.scrollHeight; // Scroll to the bottom
                        saveChatHistory(replyMsgDiv, "self"); // Save the message to chat history
                    }
                }

                if (selectedOption.back) { // If the option has a back property
                    this.currentState = selectedOption.back; // Set the current state to the back state
                    this.render(); // Render the new state
                }

                if (selectedOption.next) { // If the option has a next property
                    this.currentState = selectedOption.next; // Set the current state to the next state
                    if (selectedOption.service) { // If the option has a service property
                        this.selectedService = selectedOption.service; // Set the selected service
                    }
                    this.render(); // Render the new state
                }

                if (selectedOption.callback) { // If the option has a callback property
                    selectedOption.callback(); // Call the callback function
                }

                if (selectedOption.href) { // If the option has an href property
                    window.open(selectedOption.href, "_blank"); // Open the link in a new tab
                    return;
                }

                saveCurrentState();
            };


            // Function to render the current state
            statemachine.render = async function (isLoadingHistory = false) {
                var buttoncontainer = document.getElementById("button"); // Get the buttons container
                var currentState = statemachine.states[statemachine.currentState]; // Get the current state

                if (!currentState) {
                    console.error(`State "${statemachine.currentState}" is not defined.`);
                    return;
                }

                if (!isLoadingHistory) {
                    addMessage(currentState.message, "user"); // Add the current state's message to the chat logs
                    saveChatHistory(currentState.message, "user"); // Save the message to chat history
                }

                // Then, clear the current buttons 
                buttoncontainer.innerHTML = "";

                // Update the render function's handleUnchecked section
                if (this.currentState === "handleUnchecked" && this.uncheckedStates) {
                    const additionalOptions = currentState.render(this.uncheckedStates);

                    additionalOptions.forEach((option) => {
                        var button = document.createElement("button");
                        button.className = "titles";
                        button.innerText = option.title;

                        if (option.title === "Next Requirement") {
                            button.onclick = () => {
                                statemachine.currentUncheckedIndex++;
                                statemachine.render();
                            };
                        } else if (option.href) {
                            button.onclick = () => window.open(option.href, "_blank");
                        } else if (option.back) {
                            button.onclick = () => {
                                statemachine.currentState = option.back;
                                statemachine.render();
                            };
                        }

                        buttoncontainer.appendChild(button);
                    });
                } else {
                    // Create buttons for each option in the current state  
                    currentState.options.forEach((option, i) => {
                        if (option.type === "form") {
                            var form = createForm(option, i); // Create a form if the option type is "form"
                            buttoncontainer.appendChild(form); // Append the form to the buttons container
                        }

                        else if (option.type === "checkbox") {
                            var checkbox = createCheckbox(option.boxes()); // Create a checkbox if the option type is "checkbox"
                            buttoncontainer.appendChild(checkbox); // Append the checkbox to the buttons container
                        }

                        else if (option.type === "dropdown") {
                            var dropdown = createDropdown(option); // Create a dropdown if the option type is "dropdown"
                            buttoncontainer.appendChild(dropdown); // Append the dropdown to the buttons container
                        }

                        else if (option.type === "combined-form") {  // Add this case
                            var combinedForm = createCombinedForm(option);
                            buttoncontainer.appendChild(combinedForm);
                        }
                        // In the render function, add this case
                        else if (option.type === "radio") {
                            var radioGroup = createRadioGroup(option);
                            buttoncontainer.appendChild(radioGroup);
                        }
                        else {
                            var button = document.createElement("button"); // Create a new button element
                            button.className = "titles"; // Set the class name for the button
                            button.innerText = option.title; // Set the button text to the option title
                            button.onclick = async () => {
                                if (localStorage.getItem("currentState") == "services" && i != 5) {
                                    serviceSelected = option.title;
                                    localStorage.setItem("serviceSelected", serviceSelected);
                                }
                                if (localStorage.getItem("currentState") == "Check Signed Up" && user != null) {
                                    let signed = false;
                                    if (i == 0) {
                                        signed = true;
                                    }
                                    let result = await insertSignedUp({ userId: user, signedUp: signed });
                                    console.log(result.message);
                                }
                                this.interact(i);
                            } // Set the button's onclick handler to interact with the option
                            buttoncontainer.appendChild(button); // Append the button to the buttons container
                        }
                    });

                    chatLogs.appendChild(buttoncontainer); // Append the buttons container to the chat logs
                }
            };


            // Function to add a message to the chat logs
            function addMessage(msg, type) {
                const msgDiv = document.createElement("div"); // Create a new div element for the message
                msgDiv.className = `chat-msg ${type}`; // Set the class name for the message div
                msgDiv.innerHTML = `<div class="cm-msg-text">${msg}</div>`; // Set the inner HTML of the message div
                messagesContainer.appendChild(msgDiv); // Append the message div to the chat logs
                chatLogs.scrollTop = chatLogs.scrollHeight; // Scroll to the bottom of the chat logs
            }


            // Function to create a form for the option
            function createForm(option) {
                var form = document.createElement("form"); // Create a new form element
                form.className = "form"; // Set the class name for the form
                form.onsubmit = function (event) {
                    event.preventDefault();
                    var formData = new FormData(form);
                    var data = {};
                    option.fields.forEach(field => {
                        data[field.name] = formData.get(field.name);
                    });
                    option.callback(data); // Call the callback function with the form data
                };

                option.fields.forEach(field => {
                    var input = document.createElement("input"); // Create a new input element
                    input.type = "text"; // Set the input type to text
                    input.name = field.name; // Set the input name
                    input.placeholder = field.placeholder; // Set the input placeholder
                    form.appendChild(input); // Append the input to the form
                });

                var submitButton = document.createElement("button"); // Create a new button element
                submitButton.type = "submit"; // Set the button type to submit
                submitButton.innerText = "Submit"; // Set the button text
                form.appendChild(submitButton); // Append the button to the form

                return form;
            }


            // Function to create checkboxes for the option
            function createCheckbox(boxes) {
                var form = document.createElement("form"); // Create a new form element
                form.className = "checkbox"; // Set the class name for the form 



                boxes.forEach(box => {
                    var label = document.createElement("label");
                    var input = document.createElement("input"); // Create a new input element
                    input.type = "checkbox"; // Set the input type to checkbox
                    input.name = box.name; // Set the input name
                    input.value = box.value; // Set the input value
                    input.id = box.id; // Set the input id
                    label.appendChild(input); // Append the input to the label
                    label.appendChild(document.createTextNode(box.value)); // Append the checkbox label
                    form.appendChild(label); // Append the label to the form
                    form.appendChild(document.createElement("br")); // Add a line break
                });


                let cityKamloops = true;
                let commercialInsurance = true;
                let makershipMembership = true;
                let stirMakerFee = true;

                form.onsubmit = async function (event) {
                    event.preventDefault();
                    var uncheckedValues = [];
                    boxes.forEach(box => {
                        var checkbox = document.getElementById(box.id);

                        if (!checkbox.checked) {
                            uncheckedValues.push(box.value);

                            if (box.id == "City of Kamloops Business License") cityKamloops = false;
                            if (box.id == "Commercial Insurance") commercialInsurance = false;
                            if (box.id == "Makership Membership") makershipMembership = false;
                            if (box.id == "Stir Maker Fee") stirMakerFee = false;
                        }
                    });

                    let result = await insertLicences({ userId: user, licenses: JSON.stringify({ "City of Kamloops Business License": cityKamloops, "Commercial Insurance": commercialInsurance, "Makership Membership": makershipMembership, "Stir Maker Fee": stirMakerFee }) });
                    console.log(result.message);

                    //Handle the unchecked values as needed
                    if (uncheckedValues.length > 0) {
                        statemachine.uncheckedStates = uncheckedValues; // Store unchecked values in the state machine
                        statemachine.currentState = "handleUnchecked";
                        statemachine.render();
                    }
                    else {
                        //If all checkboxes are checked, transition to a default state
                        statemachine.currentState = "defaultState";
                        saveCurrentState(statemachine.currentState);
                        statemachine.render();
                    }
                };

                var submitButton = document.createElement("button"); // Create a new button element
                submitButton.type = "submit"; // Set the button type to submit
                submitButton.innerText = "Submit"; // Set the button text
                form.appendChild(submitButton); // Append the button to the form
                return form;
            }


            // Function to create a dropdown for the option
            function createDropdown(option) {
                var form = document.createElement("form"); // Create a new form element
                form.className = "dropdown"; // Set the class name for the form
                form.onsubmit = function (event) {
                    event.preventDefault();
                    var selectedValue = form.querySelector("select").value;
                    option.callback(selectedValue); // Call the callback function with the selected value
                };

                var select = document.createElement("select"); // Create a new select element
                select.name = option.name; // Set the select name
                option.choices.forEach(choice => {
                    var optionElement = document.createElement("option"); // Create a new option element
                    optionElement.value = choice.value; // Set the option value
                    optionElement.innerText = choice.label; // Set the option label
                    select.appendChild(optionElement); // Append the option to the select
                });
                form.appendChild(select); // Append the select to the form

                var submitButton = document.createElement("button"); // Create a new button element
                submitButton.type = "submit"; // Set the button type to submit
                submitButton.innerText = "Let's Get Cooking!"; // Set the button text
                form.appendChild(submitButton); // Append the button to the form

                return form;
            }


            // Function to get the checkboxes based on the selected service
            function getCheckboxesForService(service) {

                if (service === "warehouseSpace") {
                    return [
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Makership Membership", value: "Makership Membership", id: "Makership Membership" },
                        { name: "Stir Maker Fee", value: "Stir Maker Fee", id: "Stir Maker Fee" }
                    ];
                } else if (service === "kitchenRental") {
                    return [
                        { name: "Interior Health", value: "Interior Health", id: "Interior Health" },
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Completed Business Plan", value: "Completed Business Plan" },
                        { name: "FoodSafe Certificate", value: "FoodSafe Certificate", id: "FoodSafe Certificate" },
                        { name: "Makership Membership", value: "Makership Membership", id: "Makership Membership" },
                        { name: "Stir Maker Fee", value: "Stir Maker Fee", id: "Stir Maker Fee" }
                    ];
                } else if (service === "Event Venue") {
                    return [
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Makership Membership", value: "Makership Membership", id: "Makership Membership" },
                        { name: "Stir Maker Fee", value: "Stir Maker Fee", id: "Stir Maker Fee" }
                    ];
                } else if (service === "Business Coach") {
                    return [
                        { name: "Makership Conduct Agreement", value: "Makership Conduct Agreement", id: "Makership Conduct Agreement" },
                        { name: "Stir Maker Fee", value: "Stir Maker Fee", id: "Stir Maker Fee" }
                    ];
                }
                else if (service === "Food Processing") {
                    return [
                        { name: "Interior Health", value: "Interior Health", id: "Interior Health" },
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Completed Business Plan", value: "Completed Business Plan" }
                    ];
                }
                else if (service === "Food Service") {
                    return [
                        { name: "Interior Health", value: "Interior Health", id: "Interior Health" },
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Completed Business Plan", value: "Completed Business Plan" }
                    ];
                }
                else {
                    return [];
                }
            }


            // Add a property to track current unchecked item
            statemachine.currentUncheckedIndex = 0;

            // Modify the handleUncheckedItems function
            function handleUncheckedItems(uncheckedItems) {
                const options = [];

                if (statemachine.currentUncheckedIndex < uncheckedItems.length) {
                    const item = uncheckedItems[statemachine.currentUncheckedIndex];

                    switch (item) {
                        case "Commercial Insurance":
                            addMessage("You need insurance to protect your business. Here are some local insurance providers:", "user");
                            options.push(
                                {
                                    "title": "Click here for interior savings insurance",
                                    "href": "https://www.interiorsavings.com/business/insurance"
                                },
                                {
                                    "title": "Click here for hub international insurance",
                                    "href": "https://www.hubinternational.com/en-CA/offices/ca/british-columbia/kamloops-third-avenue/"
                                }
                            );
                            break;
                        case "City of Kamloops Business License":
                            addMessage("A business license is required to operate in Kamloops. You can apply here:", "user");
                            options.push({
                                "title": "Click Here for the business license application",
                                "href": "https://www.kamloops.ca/sites/default/files/docs/252123_Application%20for%20Business%20Licence%20Fillable%20Extended.pdf"
                            });
                            break;
                        case "Interior Health":
                            addMessage("Food safety is important! You'll need Interior Health approval:", "user");
                            options.push({
                                "title": "Click Here for the Interior Health Requirements",
                                "href": "https://www.interiorhealth.ca/sites/default/files/PDFS/application-for-food-premises-health-protection.pdf"
                            });
                            break;
                        case "Completed Business Plan":
                            addMessage("A business plan is essential for success. Here are some resources to help you get started:", "user");
                            options.push({
                                "title": "Click Here for the Business Plan Guide",
                                "href": "https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/templates-business-guides/pages/business-plan-template.aspx"
                            });
                            break;
                        case "FoodSafe Certificate":
                            addMessage("Food safety is important! You'll need a FoodSafe certificate:", "user");
                            options.push({
                                "title": "Click Here for the FoodSafe Course",
                                "href": "https://www.foodsafe.ca/"
                            });
                            break;
                        case "Makership Membership":
                            addMessage("You need to be a member of Makership to proceed. Sign up here:", "user");
                            options.push({
                                "title": "Click Here to Sign Up for Makership",
                                "href": "https://www.makerspacekamloops.ca/membership"
                            });
                            break;
                        case "Stir Maker Fee":
                            addMessage("You need to pay the Stir Maker fee to proceed. Click below to pay:", "user");
                            options.push({
                                "title": "Click Here to Pay the Stir Maker Fee",
                                "href": "https://www.stirmaker.ca/" // Update the link
                            });
                            break;
                        case "Makership Conduct Agreement":
                            addMessage("You need to agree to the Makership Conduct Agreement. Click below to review and sign:", "user");
                            options.push({
                                "title": "Click Here to Review and Sign the Conduct Agreement",
                                "href": "https://www.makerspacekamloops.ca/membership"
                            });
                            break;
                        default:
                            addMessage(`You need to complete your ${item} before proceeding.`, "user");
                    }

                    // Update the Next Requirement button
                    options.push({
                        "title": "Next Requirement",
                        "callback": function () {
                            statemachine.currentUncheckedIndex++;
                            statemachine.currentState = "handleUnchecked";
                            statemachine.render();
                        }
                    });
                } else {
                    statemachine.currentUncheckedIndex = 0;
                    options.push({
                        "title": "Back",
                        "back": "Second Phase"
                    });
                }

                return options;
            }

            function createCombinedForm(option) {
                var form = document.createElement("form");
                form.className = "combined-form";

                option.elements.forEach(element => {
                    if (element.type === "checkbox-group") {
                        const groupDiv = document.createElement("div");
                        groupDiv.className = "checkbox-group";

                        const groupLabel = document.createElement("div");
                        groupLabel.className = "group-label";
                        groupLabel.innerText = element.name;
                        groupDiv.appendChild(groupLabel);

                        element.boxes.forEach(box => {
                            var label = document.createElement("label");
                            var input = document.createElement("input");
                            input.type = "checkbox";
                            input.name = box.name;
                            input.value = box.value;
                            input.id = box.id;
                            label.appendChild(input);
                            label.appendChild(document.createTextNode(box.value));
                            groupDiv.appendChild(label);
                            groupDiv.appendChild(document.createElement("br"));
                        });
                        form.appendChild(groupDiv);
                    }
                    else if (element.type === "radio") {
                        const radioDiv = document.createElement("div");
                        radioDiv.className = "radio-group";

                        const groupLabel = document.createElement("div");
                        groupLabel.className = "group-label";
                        groupLabel.innerText = element.label;
                        radioDiv.appendChild(groupLabel);

                        element.boxes.forEach(box => {
                            var label = document.createElement("label");
                            var input = document.createElement("input");
                            input.type = "radio";
                            input.name = element.name;
                            input.value = box.value;
                            input.id = box.id;
                            label.appendChild(input);
                            label.appendChild(document.createTextNode(box.label));
                            radioDiv.appendChild(label);
                            radioDiv.appendChild(document.createElement("br"));
                        });
                        form.appendChild(radioDiv);
                    }
                    else if (element.type === "textarea") {
                        const textareaDiv = document.createElement("div");
                        textareaDiv.className = "textarea-group";

                        const textareaLabel = document.createElement("div");
                        textareaLabel.className = "group-label";
                        textareaLabel.innerText = element.label;
                        textareaDiv.appendChild(textareaLabel);

                        const textarea = document.createElement("textarea");
                        textarea.name = element.name;
                        textarea.placeholder = element.placeholder;
                        textarea.rows = 4;
                        textareaDiv.appendChild(textarea);

                        form.appendChild(textareaDiv);
                    }
                });

                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                form.appendChild(submitButton);

                form.onsubmit = function (event) {
                    event.preventDefault();
                    if (statemachine.currentState === "Event Venue") {
                        const formData = {
                            venue_capacity: Array.from(form.querySelectorAll('input[name="venue_capacity"]:checked')).map(cb => cb.value)[0],
                            venue_location: Array.from(form.querySelectorAll('input[name="venue_location"]:checked')).map(cb => cb.id)[0],
                        };
                        option.callback(formData);
                    } else {
                        const formData = {
                            foodDocs: Array.from(form.querySelectorAll('input[name="food_docs"]:checked')).map(cb => cb.id),
                            equipment: Array.from(form.querySelectorAll('input[name="equipment"]:checked')).map(cb => cb.value),
                            businessType: form.querySelector('input[name="business_type"]:checked')?.value,
                            notes: form.querySelector('textarea[name="notes"]').value,
                        };
                        option.callback(formData);

                    }

                };

                return form;
            }


            // Function to create radio buttons
            function createRadioGroup(option) {
                var form = document.createElement("form"); createRadioGroup
                form.className = "radio-form";

                const radioDiv = document.createElement("div");
                radioDiv.className = "radio-group";

                // Add group label if provided
                if (option.label) {
                    const groupLabel = document.createElement("div");
                    groupLabel.className = "group-label";
                    groupLabel.innerText = option.label;
                    radioDiv.appendChild(groupLabel);
                }

                option.boxes.forEach(box => {
                    var label = document.createElement("label");
                    var input = document.createElement("input");
                    input.type = "radio";
                    input.name = box.name;
                    input.value = box.value;
                    input.id = box.id;
                    label.appendChild(input);
                    label.appendChild(document.createTextNode(box.label || box.value));
                    radioDiv.appendChild(label);
                    radioDiv.appendChild(document.createElement("br"));
                });

                form.appendChild(radioDiv);

                // Add submit button
                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                form.appendChild(submitButton);

                // Handle form submission
                form.onsubmit = function (event) {
                    event.preventDefault();
                    var selectedValue = form.querySelector('input[type="radio"]:checked');
                    option.callback({
                        selectedValue: selectedValue ? selectedValue.value : null
                    });
                };

                return form;
            }

            // Load chat history from localStorage
            function loadChatHistory() {

                messagesContainer.innerHTML = ""; // Clear the chat logs

                const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

                history.forEach(item => {
                    const msgDiv = document.createElement("div");
                    msgDiv.className = `chat-msg ${item.type}`;

                    // Check if the message contains the reply class
                    if (item.msg.includes("cm-msg-text-reply")) {
                        msgDiv.innerHTML = item.msg;
                    } else {
                        msgDiv.innerHTML = `<div class="cm-msg-text">${item.msg}</div>`;
                    }

                    messagesContainer.appendChild(msgDiv);
                });

                const savedState = localStorage.getItem("currentState");
                if (savedState) {
                    statemachine.currentState = savedState;
                }
                console.log("Loading chat from localStorage");

                return history.length > 0;
            }


            // Load chat history from localStorage
            async function loadChatFromDB(emailIn) {

                messagesContainer.innerHTML = ""; // Clear the chat logs

                const result = await searchData({ email: emailIn });
                const history = JSON.parse(result.chat) || [];

                history.forEach(item => {
                    const msgDiv = document.createElement("div");
                    msgDiv.className = `chat-msg ${item.type}`;

                    // Check if the message contains the reply class
                    if (item.msg.includes("cm-msg-text-reply")) {
                        msgDiv.innerHTML = item.msg;
                    } else {
                        msgDiv.innerHTML = `<div class="cm-msg-text">${item.msg}</div>`;
                    }

                    messagesContainer.appendChild(msgDiv);
                });

                const savedState = result.stateChat;
                if (savedState) {
                    statemachine.currentState = savedState;
                }

                localStorage.setItem("chatHistory", JSON.stringify(history))
                console.log("Loading chat from DynamoDB");

                if (user != null && statemachine.currentState != "start" && statemachine.currentState != "Previous Conversation") {
                    let result = await insertChatHistory({ userId: user, chat: localStorage.getItem("chatHistory") });
                    console.log(result.message);
                }

                return history.length > 0;
            }


            // Function to save chat history to localStorage and DynamoDB
            async function saveChatHistory(msg, type) {
                const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

                // If msg is an HTML element (replyMsgDiv)
                if (msg instanceof HTMLElement) {
                    history.push({
                        msg: `<div class="cm-msg-text-reply">${msg.querySelector('.cm-msg-text-reply').innerHTML}</div>`,
                        type: type
                    });
                } else {
                    // For regular messages
                    history.push({
                        msg: msg,
                        type: type
                    });
                }

                localStorage.setItem("chatHistory", JSON.stringify(history));

                if (user != null && statemachine.currentState != "start" && statemachine.currentState != "Previous Conversation") {
                    let result = await insertChatHistory({ userId: user, chat: localStorage.getItem("chatHistory") });
                    console.log(result.message);
                }
            }


            // Save the current state to localStorage
            async function saveCurrentState(state) {
                localStorage.setItem("currentState", statemachine.currentState);

                console.log("Current state: " + statemachine.currentState);

                if (user != null && statemachine.currentState != "start" && statemachine.currentState != "Previous Conversation") {
                    let result = await insertStateData({ userId: user, stateChat: statemachine.currentState })
                    console.log(result.message);
                }
            }


            statemachine.currentState = "start"; // Set the initial state to start
            const hasHistory = loadChatHistory(); // Load chat history from localStorage
            if (!hasHistory) {
                statemachine.render(); // Render the initial state
            } else {
                statemachine.render(true); // Render the initial state
            }
        }
    });
}
