import { insertData, searchData, insertStateData, insertChatHistory, insertBusinessStage, insertService, insertSignedUp, insertLicences, insertProducts, insertNote, insertEventVenue, insertTimeNeeded, insertBusinessType } from "./dynamoService";

export default function StateMachine() {

    // Add event listener that fires when the document is fully loaded
    document.addEventListener("readystatechange", function (event) {
        // Check if document is completely loaded
        if (document.readyState === 'complete') {

            // Get user ID from localStorage and convert to number
            let user = Number(localStorage.getItem("userId"));
            // Get previously selected service from localStorage
            let serviceSelected = localStorage.getItem("serviceSelected");
            // Initialize variable to store event venue details
            let eventVenue;

            // Create variables for current date
            var today = new Date();
            // Get day and pad with leading zero if needed
            var dd = String(today.getDate()).padStart(2, '0');
            // Get month (adding 1 since months are 0-based) and pad with leading zero
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            // Get full year
            var yyyy = today.getFullYear();
            // Format date as MM/DD/YYYY
            today = mm + '/' + dd + '/' + yyyy;

            // Add click event listener to the chef logo
            document.getElementById("logo-image").addEventListener("click", () => {
                // Get help text element
                const helpText = document.querySelector(".help-text");
                // If help text exists, start animation
                if (helpText) {
                    helpText.style.animation = "moveTextUp 3s linear infinite";
                }
            });


            // Get chat UI elements
            const chatCircle = document.getElementById("chat-circle");
            const chatBox = document.querySelector(".chat-box");
            const chatBoxToggle = document.querySelector(".chat-box-toggle");

            // Add click event listener to clear history button
            const clearHistoryButton = document.getElementById("clearHistoryButton");
            clearHistoryButton.addEventListener("click", () => {
                // Remove all chat-related items from localStorage
                localStorage.removeItem("userId");
                localStorage.removeItem("chatHistory");
                localStorage.removeItem("serviceSelected");
                localStorage.removeItem("currentState");
                localStorage.removeItem("eventVenue");

                // Reset all variables to null
                user = null;
                serviceSelected = null;
                eventVenue = null;

                // Clear chat messages from UI
                messagesContainer.innerHTML = "";
                // Reset state machine to start state
                statemachine.currentState = "start";
                // Re-render the chat interface
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
                            "title": "Warehouse Storage Rental",
                            "next": "Contact Form",
                            "service": "warehouseSpace"
                        },
                        {
                            "title": "Commercial Kitchen Rental",
                            "next": "Contact Form",
                            "service": "kitchenRental"
                        },
                        {
                            "title": "Event Venue Rental",
                            "next": "Event Venue",
                            "service": "Event Venue"
                        },
                        // In the services state options, ensure consistency:
                        {
                            "title": "Food Business Coaching",
                            "next": "Contact Form",
                            "service": "Food Business Coaching"
                        },
                        {
                            "title": "E-Commerce",
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
                    "message": `Here is a brief explanation of each service we offer.. <br> <br> 
                    <strong>Warehouse Storage Rental</strong>:Rentable warehouse space by the pallet, available in ambient and frozen temperatures with forklift access <br><br>
                    <strong>Commercial Kitchen Rental</strong>: Interior Health approved shared commercial kitchen space available for rent by the hour for food processing and catering businesses. <br><br>
                    <strong>Event Venue Rental</strong>: A venue for hosting events <br><br> <strong>Business Coach</strong>: A coach to help you with your business <br><br>
                    <strong>Food Business Coaching</strong>: Food biz development services catered especially for food entrepreneurs, including support for permit applications, food safety planning, product development, packaging, business plan creation and food business financial planning.<br><br> 
                    <strong>Ecommerce</strong>: Become a vendor in The Stir's online marketplace with monthly pickups from The Stir.`,
                    "options": [
                        {
                            "title": "Back to Services",
                            "back": "services"
                        },
                    ]
                },

                "Type of Business": {
                    "message": "What type of business are you?",
                    "options": [
                        {
                            "label": "Business Type:",
                            "type": "radio",
                            "boxes": [
                                { name: "business_type", value: "Baker", id: "baker", label: "Baker" },
                                { name: "business_type", value: "Beverage Manufacturer", id: "beverage_manufacturer", label: "Beverage Manufacturer" },
                                { name: "business_type", value: "Caterer", id: "caterer", label: "Caterer" },
                                { name: "business_type", value: "Chef or restaurateur", id: "chef_restaurateur", label: "Chef or restaurateur" },
                                { name: "business_type", value: "Consumer packaged goods (CPG)", id: "cpg", label: "Consumer packaged goods (CPG)" },
                                { name: "business_type", value: "Delivery-only", id: "delivery_only", label: "Delivery-only" },
                                { name: "business_type", value: "Educator or cooking instructor", id: "educator_instructor", label: "Educator or cooking instructor" },
                                { name: "business_type", value: "Food truck / mobile vendor", id: "food_truck", label: "Food truck / mobile vendor" },
                                { name: "business_type", value: "Meal prep / kits", id: "meal_prep", label: "Meal prep / kits" },
                                { name: "business_type", value: "Non-food products", id: "non_food_products", label: "Non-food products" },
                                { name: "business_type", value: "Pet food maker", id: "pet_food_maker", label: "Pet food maker" },
                                { name: "business_type", value: "Value-added producer or farmer (not baker)", id: "value_added_producer", label: "Value-added producer or farmer (not baker)" },
                                { name: "business_type", value: "Other", id: "other", label: "Other" }
                            ],
                            // // Asynchronous callback function that handles business type selection
                            "callback": async function (data) {
                                // console.log(data);
                                // // Save business type to database
                                let result = await insertBusinessType({ userId: user, businessType: data.selectedValue });
                                // Log the result message
                                console.log(result.message);

                                // Set next state based on business type
                                statemachine.currentState = "Second Phase";

                                // Save current state to persistence
                                saveCurrentState(statemachine.currentState);

                                // Update the chat interface
                                statemachine.render();
                            }
                        }
                    ],
                },

                "Business Coach": {
                    "message": "Please select the type of coaching service you're interested in:",
                    "options": [
                        {
                            "type": "radio",
                            "label": "Business Coach Type:",  // Label for the radio button group
                            "boxes": [
                                { name: "coaching_needs", value: "Food Business Planning", id: "business_planning", label: "Food Business Planning" },
                                { name: "coaching_needs", value: "Food Safety Planning", id: "safety_planning", label: "Food Safety Planning" },
                                { name: "coaching_needs", value: "Product Development", id: "product_dev", label: "Product Development" },
                                { name: "coaching_needs", value: "Water Activity and pH Testing", id: "testing", label: "Water Activity and pH Testing" },
                                { name: "coaching_needs", value: "Regulatory Requirements", id: "regulatory", label: "Regulatory Requirements" }
                            ],
                            "callback": async function (data) {
                                // Log submitted form data for debugging
                                console.log("Form data:", data);

                                // // Insert coaching needs into database
                                // let result = await insertCoachingNeeds({ 
                                //     userId: user, 
                                //     coachingNeeds: JSON.stringify(data.selectedValue) 
                                // });
                                // // Log database operation result
                                // console.log(result.message);

                                // Set next state to "Final Step"
                                statemachine.currentState = "Final Step";
                                // Save current state to persistence
                                saveCurrentState();
                                // Update the chat interface
                                statemachine.render();
                            }
                        },
                        {
                            "title": "Back",
                            "back": "start"
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
                                    ],
                                    // Add onChange handler to update capacity options based on location
                                    "onChange": function (selectedValue) {
                                        const capacityGroup = document.querySelector('div[data-name="venue_capacity"]');
                                        const capacityInputs = capacityGroup.querySelectorAll('input[type="radio"]');

                                        // Enable/disable capacity options based on location
                                        capacityInputs.forEach(input => {
                                            if (selectedValue === "Indoor") {
                                                // For Indoor, only enable 0-50
                                                input.disabled = input.value !== "1-50";
                                                if (input.disabled) {
                                                    input.checked = false;
                                                    input.parentElement.classList.add('disabled');
                                                } else {
                                                    input.parentElement.classList.remove('disabled');
                                                }
                                            } else if (selectedValue === "Outdoor") {
                                                // For Outdoor, enable 50-100 and 100-150
                                                input.disabled = input.value === "1-50";
                                                if (input.disabled) {
                                                    input.checked = false;
                                                    input.parentElement.classList.add('disabled');
                                                } else {
                                                    input.parentElement.classList.remove('disabled');
                                                }
                                            }
                                        });
                                    }
                                },
                                {
                                    "type": "radio",
                                    "name": "venue_capacity",  // Second radio button group for capacity
                                    "label": "Venue Capacity:",  // Label for the radio button group
                                    "boxes": [
                                        { name: "venue_capacity", value: "1-50", id: "small", label: "1-50 People (Indoor Only)" },
                                        { name: "venue_capacity", value: "50-100", id: "medium", label: "50-100 People (Outdoor Only)" },
                                        { name: "venue_capacity", value: "100-150", id: "large", label: "100-150 People (Outdoor Only)" }
                                    ]
                                }
                            ],
                            // Asynchronous callback function that handles form submission for venue selection
                            "callback": async function (data) {
                                // Validate selection combination
                                if (data.venue_location === "Indoor" && data.venue_capacity !== "1-50") {
                                    customAlert("Indoor venues are only available for 1-50 people");
                                    return;
                                }
                                if (data.venue_location === "Outdoor" && data.venue_capacity === "1-50") {
                                    customAlert("Outdoor venues are not available for 1-50 people");
                                    return;
                                }

                                // Check if both venue capacity and location are selected
                                if (data.venue_capacity !== undefined && data.venue_location !== undefined) {
                                    // Set the state machine to move to Contact Form state
                                    statemachine.currentState = "Contact Form";
                                    // Store venue details as JSON string with location and capacity
                                    eventVenue = JSON.stringify({
                                        venue_location: data.venue_location,
                                        venue_capacity: data.venue_capacity
                                    });
                                    saveCurrentState();
                                }
                                // Re-render the state machine to show updated state
                                statemachine.render();
                            }
                        },
                    ]
                },

                "Contact Form": {
                    "message": "Before moving forward, please fill out the form below so we can keep track of this conversation",
                    "options": [
                        {
                            // Define the form structure with input fields
                            "type": "form",
                            "fields": [
                                // Input field for first name
                                { name: "f_name", placeholder: "First Name" },
                                // Input field for last name
                                { name: "l_name", placeholder: "Last Name" },
                                // Input field for business name
                                { name: "b_name", placeholder: "Business Name" },
                                // Input field for email address
                                { name: "email", placeholder: "Email" },
                                // Input field for phone number with format example
                                { name: "phone", placeholder: "Phone Number (555) 555-5555" },
                            ],
                            // Asynchronous callback function that handles form submission
                            "callback": async function (data) {
                                // Extract form data into individual variables
                                let f_name = data.f_name;
                                let l_name = data.l_name;
                                let b_name = data.b_name;
                                let email = data.email;
                                let phone = data.phone;

                                // Insert user data into database and await response
                                let response = await insertData({ f_name, l_name, b_name, email, phone, today });
                                // Log success message if data insertion was successful
                                if (response.success) console.log("User data was inserted");

                                // Store user ID in localStorage for persistence
                                localStorage.setItem("userId", response.userId);
                                // Log the user ID for debugging
                                console.log(response.userId);
                                // Update the user variable with new ID
                                user = response.userId;

                                statemachine.serviceSelected = serviceSelected;

                                if (statemachine.serviceSelected == "Food Business Coaching") {
                                    statemachine.currentState = "Business Coach";
                                } else {
                                    statemachine.currentState = "Type of Business";
                                }
                                // Save the current state
                                saveCurrentState();

                                // Insert selected service into database
                                let result = await insertService({ userId: user, service: serviceSelected });
                                // Log the result message
                                console.log(result.message)

                                // If event venue was selected, insert venue details
                                if (eventVenue != null) {
                                    result = await insertEventVenue({ userId: user, venue: eventVenue })
                                    // Log the result message
                                    console.log(result.message);
                                }

                                // Update the chat interface with new state
                                statemachine.render();
                            }
                        },
                        {
                            "title": "Back",
                            "back": "start"
                        }
                    ]
                },

                "BusinessStage": {
                    "message": "What stage is your business in?",
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
                            // Asynchronous callback function that handles business stage selection
                            "callback": async function (data) {
                                // Route user based on their selected business stage
                                if (data.selectedValue === "Brand New") {
                                    // New businesses go to information state
                                    statemachine.currentState = "information";
                                } else if (data.selectedValue === "Getting Started") {
                                    // Businesses with some progress go to second phase
                                    statemachine.currentState = "Type of Business";
                                } else if (data.selectedValue === "Up N Running") {
                                    // Operating businesses go to second phase
                                    statemachine.currentState = "Type of Business";
                                } else if (data.selectedValue === "Established") {
                                    // Established businesses go to second phase
                                    statemachine.currentState = "Type of Business";
                                } else if (data.selectedValue === "Other") {
                                    // Non-food businesses go to information state
                                    statemachine.currentState = "information";
                                }

                                // Log current user ID for debugging
                                console.log(user);
                                // Save business stage to database
                                let result = await insertBusinessStage({
                                    userId: user,
                                    businessStage: data.selectedValue
                                });

                                // Save current state if not a brand new business
                                if (data.selectedValue != "Brand New") {
                                    saveCurrentState(statemachine.currentState);
                                }
                                // Log success message if database insertion worked
                                if (result.success) console.log(result.message);

                                // Update the chat interface
                                statemachine.render();
                            }
                        }
                    ]
                },

                "information": {
                    "message": `We want your food business idea to be a success and therefore we strongly encourage you to develop a 2-year business plan before renting our kitchen and getting cooking. <br><br>
                    Check out the following links for some free business planning resources. The Stir also offers food business coaching services. <br><br>
                    You can restart this chat and inquire about Food Business Coaching services from The Stir.`,
                    "options": [
                        {
                            "title": "SSFPA Recipe for Success",
                            "href": "https://ssfpa.net/recipe-for-success/"
                        },
                        {
                            "title": "Futurpreneur Rock My Business",
                            "href": "https://futurpreneur.ca/en/program/rock-my-business/"
                        },
                        {
                            "title": "BDC Business Plan Template",
                            "href": "https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/templates-business-guides/business-plan-template"
                        },
                        {
                            "title": "Community Futures Business Boot Camp",
                            "href": "https://communityfutures.net/start-up-services/business-boot-camp/"
                        },
                        {
                            "title": "Venture Kamloops VK Accelerate",
                            "href": "https://venturekamloops.com/programs/vk-accelerate"
                        },
                    ]
                },

                "Other Phase": {
                    "message": "Please fill out our Client Interest Form and add a detailed message so that our team can learn more about your needs and connect with you.",
                    "options": [
                        {
                            "title": "Client Interest Form",
                            "href": "https://www.thekitchendoor.com/kitchen-rental/the-stir/contact-kitchen"
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

                                if (sel == "Warehouse Storage Rental") statemachine.selectedService = "warehouseSpace";
                                else if (sel == "Commercial Kitchen Rental") statemachine.selectedService = "kitchenRental";
                                else if (sel == "Event Venue Rental") statemachine.selectedService = "Event Venue";
                                else if (sel == "Food Business Coaching") statemachine.selectedService = "Business Coach";
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
                            "next": "Food Form",
                            "service": "Food Processing",
                        },
                        {
                            "title": "Food Service",
                            "next": "Food Form",
                            "service": "Food Service",
                        }
                    ]
                },


                "Food Form": {
                    "message": "Please fill out the form below so we can understand your food business needs",
                    "options": [
                        {
                            "type": "combined-form",
                            "elements": [
                                {
                                    "type": "checkbox-group",
                                    "name": "Types of Products",
                                    "boxes": [
                                        { name: "food_docs", value: "Processed & Packaged Foods", id: "Processed & Packaged Foods" },
                                        { name: "food_docs", value: "Dairy, Meat & Seafood", id: "Dairy, Meat & Seafood" },
                                        { name: "food_docs", value: "Ingredients & Seasonings", id: "Ingredients & Seasonings" },
                                        { name: "food_docs", value: "Speciality & Agricultural Products", id: "Speciality & Agricultural Products" },
                                        { name: "food_docs", value: "Other Products", id: "Other" }
                                    ]
                                },
                                {
                                    "type": "radio",
                                    "name": "business_type",
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
                            // Asynchronous callback function to handle food form submission
                            "callback": async function (data) {
                                // Log submitted form data for debugging
                                console.log("Form data:", data);

                                // Insert selected products into database
                                let result = await insertProducts({
                                    userId: user,
                                    products: JSON.stringify(data.foodDocs)
                                });
                                // Log database operation result
                                console.log(result.message);

                                // Insert additional notes into database
                                result = await insertNote({
                                    userId: user,
                                    note: JSON.stringify(data.notes)
                                });
                                // Log database operation result
                                console.log(result.message);

                                // Insert time needed into database with hours suffix
                                result = await insertTimeNeeded({
                                    userId: user,
                                    timeNeeded: JSON.stringify(data.timeNeeded + " hours")
                                });
                                // Log database operation result
                                console.log(result.message);

                                statemachine.currentState = "Final Step";

                                // Save current state to persistence
                                saveCurrentState();
                                // Update the chat interface
                                statemachine.render();
                            }
                        },
                        {
                            "title": "Back",
                            "back": "start"
                        }
                    ]
                },

                "Final Step": {
                    "message": "Thank you for your time. We will get back to you shortly",
                    "options": [
                        {
                            "title": "Back to Start",
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
                // Get current state and selected option from state machine
                var currentState = statemachine.states[statemachine.currentState];
                var selectedOption = currentState.options[option];

                // Handle user response in chat interface
                const lastMsgDiv = messagesContainer.lastElementChild;
                if (lastMsgDiv && lastMsgDiv.classList.contains("chat-msg")) {
                    const msgTextDiv = lastMsgDiv.querySelector(".cm-msg-text");
                    if (msgTextDiv) {
                        // Create new message div for user response
                        const replyMsgDiv = document.createElement("div");
                        replyMsgDiv.className = "chat-msg user";
                        // Add selected option title as reply text
                        replyMsgDiv.innerHTML = `<div class="cm-msg-text-reply">${selectedOption.title}</div>`;
                        // Add message to chat and scroll to bottom
                        messagesContainer.appendChild(replyMsgDiv);
                        chatLogs.scrollTop = chatLogs.scrollHeight;
                        // Save chat history
                        saveChatHistory(replyMsgDiv, "self");
                    }
                }

                // Handle back navigation
                if (selectedOption.back) {
                    this.currentState = selectedOption.back;
                    this.render();
                }

                // Handle forward navigation
                if (selectedOption.next) {
                    this.currentState = selectedOption.next;
                    // Update selected service if specified 
                    if (selectedOption.service) {
                        this.selectedService = selectedOption.service;
                    }
                    this.render();
                }

                // Execute callback if defined
                if (selectedOption.callback) {
                    selectedOption.callback();
                }

                // Handle external links
                if (selectedOption.href) {
                    window.open(selectedOption.href, "_blank");
                    return;
                }

                // Save current state to persistence
                saveCurrentState();
            };


            // Function to render the current state
            statemachine.render = async function (isLoadingHistory = false) {
                // Get the buttons container element from DOM
                var buttoncontainer = document.getElementById("button");
                // Get the current state object from state machine
                var currentState = statemachine.states[statemachine.currentState];

                // Check if current state exists
                if (!currentState) {
                    // Log error and exit if state is not defined
                    console.error(`State "${statemachine.currentState}" is not defined.`);
                    return;
                }

                // Only add messages if not loading history
                if (!isLoadingHistory) {
                    // Add the current state's message to chat logs
                    addMessage(currentState.message, "self");
                    // Save message to chat history
                    saveChatHistory(currentState.message, "self");
                }

                // Clear existing buttons from container
                buttoncontainer.innerHTML = "";

                // Handle unchecked requirements state
                if (this.currentState === "handleUnchecked" && this.uncheckedStates) {
                    // Get additional options from rendering unchecked states
                    const additionalOptions = currentState.render(this.uncheckedStates);

                    // Create buttons for each additional option
                    additionalOptions.forEach((option) => {
                        // Create button element
                        var button = document.createElement("button");
                        // Add styling class
                        button.className = "titles";
                        // Set button text
                        button.innerText = option.title;

                        // Handle different button types
                        if (option.title === "Next Requirement") {
                            // Next requirement button moves to next unchecked item
                            button.onclick = () => {
                                statemachine.currentUncheckedIndex++;
                                statemachine.render();
                            };
                        } else if (option.href) {
                            // External link button opens in new tab
                            button.onclick = () => window.open(option.href, "_blank");
                        } else if (option.back) {
                            // Back button returns to previous state
                            button.onclick = () => {
                                statemachine.currentState = option.back;
                                statemachine.render();
                            };
                        }

                        // Add button to container
                        buttoncontainer.appendChild(button);
                    });
                } else {
                    // Create buttons for each option in the current state  
                    currentState.options.forEach((option, i) => {
                        // Handle different form types
                        if (option.type === "form") {
                            // Create a standard form element
                            var form = createForm(option, i);
                            buttoncontainer.appendChild(form);
                        }
                        else if (option.type === "checkbox") {
                            // Create a checkbox group element
                            var checkbox = createCheckbox(option.boxes());
                            buttoncontainer.appendChild(checkbox);
                        }
                        else if (option.type === "combined-form") {
                            // Create a combined form with multiple input types
                            var combinedForm = createCombinedForm(option);
                            buttoncontainer.appendChild(combinedForm);
                        }
                        else if (option.type === "radio") {
                            // Create a radio button group
                            var radioGroup = createRadioGroup(option);
                            buttoncontainer.appendChild(radioGroup);
                        }
                        else {
                            // Create a standard button for other options
                            var button = document.createElement("button");
                            button.className = "titles";
                            button.innerText = option.title;

                            // Add click handler for button
                            button.onclick = async () => {
                                // Handle service selection
                                if (localStorage.getItem("currentState") == "services" && i != 5) {
                                    serviceSelected = option.title;
                                    localStorage.setItem("serviceSelected", serviceSelected);
                                }
                                // Handle Food Corridor signup status
                                if (localStorage.getItem("currentState") == "Check Signed Up" && user != null) {
                                    let signed = false;
                                    if (i == 0) {
                                        signed = true;
                                    }
                                    // Save signup status to database
                                    let result = await insertSignedUp({ userId: user, signedUp: signed });
                                    console.log(result.message);
                                }
                                // Trigger state machine interaction
                                this.interact(i);
                            }
                            // Add button to container
                            buttoncontainer.appendChild(button);
                        }
                    });

                    // Add all buttons to chat interface
                    chatLogs.appendChild(buttoncontainer);
                }
            };


            // Function to add a message to the chat logs
            function addMessage(msg, type) {
                const msgDiv = document.createElement("div");
                msgDiv.className = `chat-msg ${type}`;

                // If it's a user message, use cm-msg-text-reply
                if (type === "user") {
                    // Check if the message already contains the div class
                    if (!msg.includes('cm-msg-text-reply')) {
                        msgDiv.innerHTML = `<div class="cm-msg-text-reply">${msg}</div>`;
                    } else {
                        msgDiv.innerHTML = msg;
                    }
                } else {
                    // For bot messages (type "self"), use cm-msg-text
                    msgDiv.innerHTML = `<div class="cm-msg-text">${msg}</div>`;
                }

                messagesContainer.appendChild(msgDiv);
                chatLogs.scrollTop = chatLogs.scrollHeight;
            }


            // Function to create a form for the option
            function createForm(option) {
                // Create form element and set up basic properties
                var form = document.createElement("form");
                form.className = "form";

                // Add submit handler to form
                form.onsubmit = function (event) {
                    // Prevent default form submission
                    event.preventDefault();
                    // Create FormData object from form
                    var formData = new FormData(form);
                    // Initialize data object
                    var data = {};
                    // Extract all field values
                    option.fields.forEach(field => {
                        data[field.name] = formData.get(field.name);
                    });
                    // Execute callback with form data
                    option.callback(data);
                };

                // Create input fields based on options
                option.fields.forEach(field => {
                    // Create input element
                    var input = document.createElement("input");
                    // Set default type to text
                    input.type = "text";
                    // Set input name from field options
                    input.name = field.name;
                    // Set placeholder text
                    input.placeholder = field.placeholder;
                    // Make field required
                    input.required = true;

                    // Special handling for email fields
                    if (field.name === "email") {
                        // Set input type to email
                        input.type = "email";
                        // Add email validation pattern
                        input.pattern = "^\\w+@\\w+\\.[a-zA-Z]{2,}$";
                    }
                    // Special handling for phone fields
                    else if (field.name === "phone") {
                        // Add input formatter for phone numbers
                        input.addEventListener('input', function (e) {
                            // Remove non-digits and format as (XXX) XXX-XXXX
                            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
                        });
                    }
                    // Add input to form
                    form.appendChild(input);
                });

                // Create submit button
                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                // Add button to form
                form.appendChild(submitButton);

                // Return completed form
                return form;
            }


            // Function to create checkboxes for the option
            function createCheckbox(boxes) {
                // Create a new form element for checkboxes
                var form = document.createElement("form");
                // Set the class name for styling
                form.className = "checkbox";

                // Create checkboxes for each option
                boxes.forEach(box => {
                    // Create label element to wrap checkbox
                    var label = document.createElement("label");
                    // Create checkbox input element
                    var input = document.createElement("input");
                    input.type = "checkbox";
                    input.name = box.name;
                    input.value = box.value;
                    input.id = box.id;
                    // Add input to label
                    label.appendChild(input);
                    // Add checkbox label text
                    label.appendChild(document.createTextNode(box.value));
                    // Add label to form
                    form.appendChild(label);
                    // Add line break for spacing
                    form.appendChild(document.createElement("br"));
                });

                // Initialize tracking variables for required items
                let cityKamloops = true;
                let commercialInsurance = true;
                let makershipMembership = true;
                let interiorHealth = true;
                let completedBusinessPlan = true;
                let foodSafeCertificate = true;
                let foodCorridorMembership = true;

                // Handle form submission
                form.onsubmit = async function (event) {
                    // Prevent default form submission
                    event.preventDefault();
                    // Track checked and unchecked items
                    var uncheckedValues = [];
                    var checkedValues = [];

                    // Check status of each checkbox
                    boxes.forEach(box => {
                        var checkbox = document.getElementById(box.id);
                        if (!checkbox.checked) {
                            // Add to unchecked list
                            uncheckedValues.push(box.value);

                            console.log(box);
                            // Update tracking variables
                            if (box.id == "City of Kamloops Business License") cityKamloops = false;
                            if (box.id == "Commercial Insurance") commercialInsurance = false;
                            if (box.id == "Stir Maker Membership") makershipMembership = false;
                            if (box.id == "Food Corridor Membership") foodCorridorMembership = false;
                            if (box.id == "Interior Health") interiorHealth = false;
                            if (box.id == "Completed Business Plan") completedBusinessPlan = false;
                            if (box.id == "FoodSafe Certificate") foodSafeCertificate = false;
                        } else {
                            // Add to checked list  
                            checkedValues.push(box.value);
                        }
                    });

                    // Display summary of checked items
                    if (checkedValues.length > 0) {
                        const summaryMsg = `<div class="cm-msg-text-reply">You have:<br> ${checkedValues.join("<br><br>")}</div>`;
                        addMessage(summaryMsg, "user");
                        saveChatHistory(summaryMsg, "user");
                    }

                     let result;
 
                     if (localStorage.getItem("serviceSelected") == "Commercial Kitchen Rental") {
                         // Save license status to database
                         result = await insertLicences({
                             userId: user,
                             licenses: JSON.stringify({
                                 "City of Kamloops Business License": cityKamloops,
                                 "Commercial Insurance": commercialInsurance,
                                 "Stir Maker Membership": makershipMembership,
                                 "Food Corridor Membership": foodCorridorMembership,
                                 "Interior Health": interiorHealth,
                                 "Completed Business Plan": completedBusinessPlan,
                                 "FoodSafe Certificate": foodSafeCertificate
                             })
                         });
                         console.log(result.message);
                     }
                     else {
                         // Save license status to database
                         result = await insertLicences({
                             userId: user,
                             licenses: JSON.stringify({
                                 "Food Corridor Membership": foodCorridorMembership,
                                 "Commercial Insurance": commercialInsurance,
                                 "Stir Makership Membership": makershipMembership,
                             })
                         });
                         console.log(result.message);
                     }

                    // Handle navigation based on checked status
                    if (uncheckedValues.length > 0) {
                        // If missing items, go to unchecked handler
                        statemachine.uncheckedStates = uncheckedValues;
                        statemachine.currentState = "handleUnchecked";
                        statemachine.render();
                    } else {
                        // If all checked, go to default state
                        statemachine.currentState = "defaultState";
                        saveCurrentState(statemachine.currentState);
                        statemachine.render();
                    }
                };

                // Create and add submit button
                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                form.appendChild(submitButton);

                // Return completed form
                return form;
            }


            // Function to get the checkboxes based on the selected service
            function getCheckboxesForService(service) {

                if (service === "warehouseSpace") {
                    return [
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Food Corridor Membership", value: "Food Corridor Membership", id: "Food Corridor Membership" },
                        { name: "Stir Maker Membership", value: "Stir Maker Membership", id: "Stir Maker Membership" }
                    ];
                } else if (service === "kitchenRental") {
                    return [
                        { name: "Interior Health", value: "Interior Health", id: "Interior Health" },
                        { name: "City of Kamloops Business License", value: "City of Kamloops Business License", id: "City of Kamloops Business License" },
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Completed Business Plan", value: "Completed Business Plan", id:"Completed Business Plan"},
                        { name: "FoodSafe Certificate", value: "FoodSafe Certificate", id: "FoodSafe Certificate" },
                        { name: "Stir Maker Membership", value: "Stir Maker Membership", id: "Stir Maker Membership" },
                        { name: "Food Corridor Membership", value: "Food Corridor Membership", id: "Food Corridor Membership" }
                    ];
                } else if (service === "Event Venue") {
                    return [
                        { name: "Commercial Insurance", value: "Commercial Insurance", id: "Commercial Insurance" },
                        { name: "Food Corridor Membership", value: "Food Corridor Membership", id: "Food Corridor Membership" },
                        { name: "Stir Maker Membership", value: "Stir Maker Membership", id: "Stir Maker Membership" }
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
                            const CImsg = "Stir Makers are required, at their own expense, to maintain comprehensive general liability insurance with a minimum $3,000,000 general aggregate, with Kamloops Food Policy Council (185 Royal Ave, Kamloops, BC, V2B 8J6) listed as additional insured";
                            addMessage(CImsg, "self");
                            saveChatHistory(CImsg, "self");
                            options.push(
                                {
                                    "title": "Click here for Interior Savings Insurance",
                                    "href": "https://www.interiorsavings.com/business/insurance"
                                },
                                {
                                    "title": "Click here for Hub International Insurance",
                                    "href": "https://www.hubinternational.com/en-CA/offices/ca/british-columbia/kamloops-third-avenue/"
                                },
                                {
                                    "title": "Click here for Kamloops Insurance",
                                    "href": "https://kamloopsinsurance.ca/"
                                }
                            );
                            break;
                        case "City of Kamloops Business License":
                            const BLmsg = "When you apply for Interior Health approval at our food hub address, they will notify the City of Kamloops Business License office. The City will require you to submit an application for a city business license and pay the associated fee. Once Interior Health approves your food premises application, they will sign off on your business license application and the City will issue your license.";
                            addMessage(BLmsg, "self");
                            saveChatHistory(BLmsg, "self");
                            options.push({
                                "title": "Click Here for the business license application",
                                "href": "https://www.kamloops.ca/sites/default/files/docs/252123_Application%20for%20Business%20Licence%20Fillable%20Extended.pdf"
                            });
                            break;
                        case "Interior Health":
                            const IHmsg = `
                                <div class="cm-msg-text">
                                    Food safety is important! You'll need Interior Health approval. Here's how to fill out the application <br><br>
                                    <strong>Section A:</strong><br><br>
                                    <strong>Business/Facility Name:</strong> Your Business Name<br><br>
                                    <strong>Business/Facility Email:</strong> foodhub@kamloopsfoodpolicycouncil.com<br><br>
                                    <strong>Facility Site Address:</strong> 185 Royal Ave, Kamloops, BC, V2C 6A9<br><br>
                                    <strong>Site Phone:</strong> 778.870.9867<br><br>
                                    <strong>Cell Phone:</strong> Your Cell Number<br><br>
                                    <strong>Type of Ownership:</strong> Check what applies to your business<br><br>
                                    <strong>Legal Owner Name:</strong> Your business name (if incorporated) or your name (if sole proprietorship/partnership)<br><br>
                                    Fill remaining sections with your contact info and mailing address<br><br>
                            
                                    <strong>Section B:</strong><br><br>
                                    <strong>Start Date:</strong> Your planned start date<br><br>
                                    <strong>Months of Operation:</strong> Specify if not year-round<br><br>
                            
                                    <strong>Business Type - Check one of the following:</strong><br><br>
                                    <strong>For Food Processors:</strong><br><br>
                                    Check "Food Other" and "Other"<br><br>
                                    Specify your product (e.g., "Canning")<br><br>
                            
                                    <strong>For Bakeries:</strong><br><br>
                                    Check "Food Other" and "Bakery"<br><br>
                            
                                    <strong>For Caterers:</strong><br><br>
                                    Check "Food Service Establishment"<br><br>
                                    Check "50 seats or less"<br><br>
                                    Write "Catering" in the box<br><br>
                            
                                    <strong>Additional Info:</strong><br><br>
                                    Sewage Waste Disposal: Check community sewer
                                </div>`;
                            addMessage(IHmsg, "self");
                            saveChatHistory(IHmsg, "self");

                            options.push({
                                "title": "Click Here for the Interior Health Application Form",
                                "href": "https://www.interiorhealth.ca/sites/default/files/PDFS/application-for-food-premises-health-protection.pdf"
                            },
                                {
                                    "title": "Interior Health Guide for Food Premises",
                                    "href": "https://www.interiorhealth.ca/sites/default/files/PDFS/guide-applying-for-food-premises-approval.pdf"
                                });
                            break;
                        case "Completed Business Plan":
                            const BPmsg = `We want your food business idea to be a success and therefore we strongly encourage you to develop a 2-year business plan before renting our kitchen and getting cooking. <br><br>
                            Check out the following links for some free business planning resources. The Stir also offers food business coaching services. <br><br>
                            You can restart this chat and inquire about Food Business Coaching services from The Stir.`;
                            addMessage(BPmsg, "self");
                            saveChatHistory(BPmsg, "self");
                            options.push(
                                {
                                    "title": "SSFPA Recipe for Success",
                                    "href": "https://ssfpa.net/recipe-for-success/"
                                },
                                {
                                    "title": "Futurpreneur Rock My Business",
                                    "href": "https://futurpreneur.ca/en/program/rock-my-business/"
                                },
                                {
                                    "title": "BDC Business Plan Template",
                                    "href": "https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/templates-business-guides/business-plan-template"
                                },
                                {
                                    "title": "Community Futures Business Boot Camp",
                                    "href": "https://communityfutures.net/start-up-services/business-boot-camp/"
                                },
                                {
                                    "title": "Venture Kamloops VK Accelerate",
                                    "href": "https://venturekamloops.com/programs/vk-accelerate"
                                },
                            );
                            break;
                        case "FoodSafe Certificate":
                            const FSmsg = "Food safety is important! You'll need a FoodSafe certificate:";
                            addMessage(FSmsg, "self");
                            saveChatHistory(FSmsg, "self");
                            options.push({
                                "title": "Click Here for the Online FoodSafe Course",
                                "href": "https://www.openschool.bc.ca/foodsafe_level1/"
                            },
                                {
                                    "title": "Click Here for the In-Person FoodSafe Course",
                                    "href": "https://courses.foodsafe.ca/course-search?field_course_name_tid=7&field_health_authorities_tid=1027&field_city_tid=4502&field_language_tid=38"
                                });
                            break;
                        case "Stir Maker Membership":
                            const MMmsg = "You need to be a member of Makership to proceed. Sign up here:";
                            addMessage(MMmsg, "self");
                            saveChatHistory(MMmsg, "self");
                            options.push({
                                "title": "Click Here to Sign Up for Makership",
                                "href": "https://ca.services.docusign.net/webforms-ux/v1.0/forms/0de6dc66d96f1048f3d26c24a4ccfa07"
                            });
                            break;
                        case "Food Corridor Membership":
                            const SMmsg = "You need to sign up for the Food Corridor for the Membership. Click below to Sign up:";
                            addMessage(SMmsg, "self");
                            saveChatHistory(SMmsg, "self");
                            options.push({
                                "title": "Sign Up for Food Corridor",
                                "href": "https://app.thefoodcorridor.com/en/signup?default_kitchen=21957" // Update the link
                            });
                            break;
                        default:
                            addMessage(`You need to complete your ${item} before proceeding.`, "user");
                    }

                    options.push({
                        "title": "Next Requirement",
                        "callback": function () {
                            // Increment index and refresh display
                            statemachine.currentUncheckedIndex++;
                            statemachine.currentState = "handleUnchecked";
                            statemachine.render();
                        }
                    });
                } else {
                    // Reset index when all items are processed
                    statemachine.currentUncheckedIndex = 0;
                    // Add back navigation option
                    options.push({
                        "title": "Back",
                        "back": "Second Phase"
                    });
                }

                // Return navigation options
                return options;
            }

            function createCombinedForm(option) {
                // Create new form element with combined form class
                var form = document.createElement("form");
                form.className = "combined-form";

                // Process each form element based on type
                option.elements.forEach(element => {
                    // Handle checkbox groups
                    if (element.type === "checkbox-group") {
                        // Create container for checkbox group
                        const groupDiv = document.createElement("div");
                        groupDiv.className = "checkbox-group";

                        // Create and add group label
                        const groupLabel = document.createElement("div");
                        groupLabel.className = "group-label";
                        groupLabel.innerText = element.name + " (Select at least one)"; // Add requirement note
                        groupDiv.appendChild(groupLabel);

                        // Create individual checkboxes
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
                    // Handle radio button groups
                    else if (element.type === "radio") {
                        // Create container for radio group
                        const radioDiv = document.createElement("div");
                        radioDiv.className = "radio-group";

                        // Create and add group label
                        const groupLabel = document.createElement("div");
                        groupLabel.className = "group-label";
                        groupLabel.innerText = element.label;
                        radioDiv.appendChild(groupLabel);

                        // Create individual radio buttons
                        element.boxes.forEach(box => {
                            var label = document.createElement("label");
                            var input = document.createElement("input");
                            input.type = "radio";
                            input.name = element.name;
                            input.value = box.value;
                            input.id = box.id;
                            input.required = true;
                            label.appendChild(input);
                            label.appendChild(document.createTextNode(box.label));
                            radioDiv.appendChild(label);
                            radioDiv.appendChild(document.createElement("br"));
                        });
                        form.appendChild(radioDiv);
                    }
                    // Handle textarea elements
                    else if (element.type === "textarea") {
                        // Create container for textarea
                        const textareaDiv = document.createElement("div");
                        textareaDiv.className = "textarea-group";

                        // Create and add textarea label
                        const textareaLabel = document.createElement("div");
                        textareaLabel.className = "group-label";
                        textareaLabel.innerText = element.label;
                        textareaDiv.appendChild(textareaLabel);

                        // Create textarea element
                        const textarea = document.createElement("textarea");
                        textarea.name = element.name;
                        textarea.placeholder = element.placeholder;
                        textarea.rows = 4;
                        textareaDiv.appendChild(textarea);

                        form.appendChild(textareaDiv);
                    }
                });

                // Add submit button to form
                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                form.appendChild(submitButton);

                // Handle form submission
                form.onsubmit = function (event) {
                    event.preventDefault();

                    if (statemachine.currentState === "Event Venue") {
                        // Get all selected values for both venue capacity and location
                        const selectedCapacity = form.querySelector('input[name="venue_capacity"]:checked');
                        const selectedLocation = form.querySelector('input[name="venue_location"]:checked');

                        // Check if both capacity and location are selected
                        if (!selectedCapacity || !selectedLocation) {
                            customAlert("Please select both venue capacity and location before submitting.");
                            return;
                        }

                        // Collect form data from valid selections
                        const formData = {
                            venue_capacity: selectedCapacity.value,
                            venue_location: selectedLocation.id
                        };

                        // Display selection summary
                        const summaryMsg = `<div class="cm-msg-text-reply">You picked: <br><br> ${formData.venue_location} venue <br><br> ${formData.venue_capacity} people</div>`;
                        addMessage(summaryMsg, "user");
                        saveChatHistory(summaryMsg, "user");
                        option.callback(formData);
                    }
                    // Handle other form types
                    else {
                        // Check if at least one checkbox is checked
                        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
                        const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

                        if (!isChecked) {
                            customAlert("Please select at least one option before submitting.");
                            return;
                        }

                        // Collect form data
                        const formData = {
                            foodDocs: Array.from(form.querySelectorAll('input[name="food_docs"]:checked')).map(cb => cb.id),
                            timeNeeded: form.querySelector('input[name="business_type"]:checked')?.value,
                            notes: form.querySelector('textarea[name="notes"]').value,
                        };

                        // Build summary message
                        let summaryParts = [];
                        if (formData.foodDocs.length > 0) {
                            summaryParts.push(`Products: ${formData.foodDocs.join(", ")}`);
                        }
                        if (formData.timeNeeded) {
                            summaryParts.push(`Time Needed: ${formData.timeNeeded} hours`);
                        }
                        if (formData.notes) {
                            summaryParts.push(`Additional Notes: ${formData.notes}`);
                        }

                        // Display selection summary
                        const summaryMsg = `<div class="cm-msg-text-reply">You picked:<br>${summaryParts.join("<br><br>")}</br></div>`;
                        addMessage(summaryMsg, "user");
                        saveChatHistory(summaryMsg, "user");
                        option.callback(formData);
                    }
                };

                return form;
            }


            // Function to create radio buttons
            function createRadioGroup(option) {
                // Create new form element for radio buttons
                var form = document.createElement("form");
                form.className = "radio-form";

                // Create container for radio buttons
                const radioDiv = document.createElement("div");
                radioDiv.className = "radio-group";

                // Add group label if provided in options
                if (option.label) {
                    const groupLabel = document.createElement("div");
                    groupLabel.className = "group-label";
                    groupLabel.innerText = option.label;
                    radioDiv.appendChild(groupLabel);
                }

                // Create radio buttons for each option
                option.boxes.forEach(box => {
                    // Create label to wrap radio button
                    var label = document.createElement("label");
                    // Create radio input element
                    var input = document.createElement("input");
                    input.type = "radio";
                    input.name = box.name;
                    input.value = box.value;
                    input.id = box.id;
                    input.required = true;
                    // Add input to label
                    label.appendChild(input);
                    // Add radio button label text (use label if provided, otherwise use value)
                    label.appendChild(document.createTextNode(box.label || box.value));
                    // Add label to container
                    radioDiv.appendChild(label);
                    // Add line break for spacing
                    radioDiv.appendChild(document.createElement("br"));
                });

                // Add radio group to form
                form.appendChild(radioDiv);

                // Create and add submit button
                var submitButton = document.createElement("button");
                submitButton.type = "submit";
                submitButton.innerText = "Submit";
                form.appendChild(submitButton);

                // Handle form submission
                form.onsubmit = function (event) {
                    // Prevent default form submission
                    event.preventDefault();

                    // Get selected radio button
                    var selectedValue = form.querySelector('input[type="radio"]:checked');

                    // Validate that an option was selected
                    if (selectedValue == null) {
                        alert("Please select at least one option before submitting.");
                        event.preventDefault();
                    }
                    else {
                        // Display selection summary
                        const summaryMsg = `<div class="cm-msg-text-reply">You selected: ${selectedValue.value}</div>`;
                        addMessage(summaryMsg, "user");
                        saveChatHistory(summaryMsg, "user");

                        // Execute callback with selected value
                        option.callback({
                            selectedValue: selectedValue ? selectedValue.value : null
                        });
                    }
                };

                // Return completed form
                return form;
            }

            // Function to load chat history from localStorage
            function loadChatHistory() {
                // Clear existing chat messages
                messagesContainer.innerHTML = "";

                // Get chat history from localStorage, default to empty array if none exists
                const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

                // Process each message in history
                history.forEach(item => {
                    // Create message container div
                    const msgDiv = document.createElement("div");
                    // Set class for styling (chat-msg + user/self)
                    msgDiv.className = `chat-msg ${item.type}`;

                    // Handle different message types
                    if (item.msg.includes("cm-msg-text-reply")) {
                        // User replies keep original HTML structure
                        msgDiv.innerHTML = item.msg;
                    } else {
                        // Bot messages get wrapped in cm-msg-text div
                        msgDiv.innerHTML = `<div class="cm-msg-text">${item.msg}</div>`;
                    }

                    // Add message to chat container
                    messagesContainer.appendChild(msgDiv);
                });

                // Restore previous state if it exists
                const savedState = localStorage.getItem("currentState");
                if (savedState) {
                    statemachine.currentState = savedState;
                }
                // Log source of chat history
                console.log("Loading chat from localStorage");

                // Return whether history exists
                return history.length > 0;
            }

            // Function to load chat history from DynamoDB database
            async function loadChatFromDB(emailIn) {
                // Clear existing chat messages
                messagesContainer.innerHTML = "";

                // Fetch user data from database using email
                const result = await searchData({ email: emailIn });
                // Parse chat history from result, default to empty array if none exists
                const history = JSON.parse(result.chat) || [];

                // Process each message in history
                history.forEach(item => {
                    // Create message container div
                    const msgDiv = document.createElement("div");
                    // Set class for styling (chat-msg + user/self)
                    msgDiv.className = `chat-msg ${item.type}`;

                    // Handle different message types
                    if (item.msg.includes("cm-msg-text-reply")) {
                        // User replies keep original HTML structure
                        msgDiv.innerHTML = item.msg;
                    } else {
                        // Bot messages get wrapped in cm-msg-text div
                        msgDiv.innerHTML = `<div class="cm-msg-text">${item.msg}</div>`;
                    }

                    // Add message to chat container
                    messagesContainer.appendChild(msgDiv);
                });

                // Restore previous state from database
                const savedState = result.stateChat;
                if (savedState) {
                    statemachine.currentState = savedState;
                }

                // Update localStorage with loaded chat history
                localStorage.setItem("chatHistory", JSON.stringify(history));
                console.log("Loading chat from DynamoDB");

                // If user is logged in and not in initial states, update database
                if (user != null && statemachine.currentState != "start" &&
                    statemachine.currentState != "Previous Conversation") {
                    let result = await insertChatHistory({
                        userId: user,
                        chat: localStorage.getItem("chatHistory")
                    });
                    console.log(result.message);
                }

                // Return whether history exists
                return history.length > 0;
            }


            // Function to save chat history to localStorage and DynamoDB
            async function saveChatHistory(msg, type) {
                // Get existing chat history or create new empty array
                const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

                // Handle different message types
                if (msg instanceof HTMLElement) {
                    // For HTML elements (like reply messages), extract inner content
                    history.push({
                        msg: `<div class="cm-msg-text-reply">${msg.querySelector('.cm-msg-text-reply').innerHTML}</div>`,
                        type: type
                    });
                } else {
                    // For regular text messages
                    history.push({
                        msg: msg,
                        type: type
                    });
                }

                // Save updated history to localStorage
                localStorage.setItem("chatHistory", JSON.stringify(history));

                // If user is logged in and not in initial states, save to database
                if (user != null && statemachine.currentState != "start" &&
                    statemachine.currentState != "Previous Conversation") {
                    let result = await insertChatHistory({
                        userId: user,
                        chat: localStorage.getItem("chatHistory")
                    });
                    console.log(result.message);
                }
            }

            // Function to save current state to localStorage and database
            async function saveCurrentState(state) {
                // Save current state to localStorage
                localStorage.setItem("currentState", statemachine.currentState);
                console.log("Current state: " + statemachine.currentState);

                // If user is logged in and not in initial states, save to database
                if (user != null && statemachine.currentState != "start" &&
                    statemachine.currentState != "Previous Conversation") {
                    let result = await insertStateData({
                        userId: user,
                        stateChat: statemachine.currentState
                    });
                    console.log(result.message);
                }
            }

            // Custom alert function to display messages in the chat interface
            function customAlert(message) {
                const alertMsg = `<div class="cm-msg-text-reply">${message}</div>`;
                addMessage(alertMsg, "user");
                saveChatHistory(alertMsg, "user");
            }

            // Initialize state machine
            statemachine.currentState = "start"; // Set initial state
            const hasHistory = loadChatHistory(); // Load existing chat history

            // Render appropriate state based on history
            if (!hasHistory) {
                statemachine.render(); // Render fresh state
            } else {
                statemachine.render(true); // Render with history
            }
        }
    });
}

// Function to format phone numbers consistently
function formatPhoneNumber(input) {
    // Validate phone number against regex pattern
    if (!phoneRegex.test(input)) {
        return null; // Return null if invalid phone number
    }

    // Extract only digits from input, removing any other characters
    const digits = input.replace(/\D/g, '');

    // Format digits into XXX-XXX-XXXX pattern
    const formattedNumber = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    return formattedNumber;
}
