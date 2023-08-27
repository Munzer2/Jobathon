const notificationIcon = document.querySelector('.notification-icon');
const notificationDetails = document.querySelector('.notification-details');

notificationIcon.addEventListener('click', () => {
    notificationDetails.classList.toggle('active'); 
});

const jobOfferIcon = document.querySelector('.job-offer-icon');
const jobOfferDetails = document.querySelector('.job-offer-details');

jobOfferIcon.addEventListener('click', () => {
    jobOfferDetails.classList.toggle('active');
});

// Close the notification and job offer details when clicking outside of them




const hobbyIcon = document.querySelector('.hobby-icon');
const hobbyDetails = document.querySelector('.hobbyDetails');
const userID =document.body.getAttribute('data-user-ID'); 

hobbyIcon.addEventListener('click', async () => {
    hobbyDetails.classList.toggle('active');

    if (hobbyDetails.classList.contains('active')) {
        try {
            const response = await fetch(`/fetchHobbies/${userID}`);
            const hobbies = await response.json();

            const hobbiesList = document.createElement('ul');
            hobbies.forEach(hobby => {
                const hobbyItem = document.createElement('li');
                hobbyItem.textContent = hobby;
                hobbiesList.appendChild(hobbyItem);
            });

            hobbyDetails.innerHTML = '';
            hobbyDetails.appendChild(hobbiesList);
        } catch (error) {
            console.error('Error fetching hobbies:', error);
        }
    } else {
        hobbyDetails.innerHTML = '';
    }
});



///Adding new Hobby. 
///const addHobbyButton = document.getElementById('addHobbyButton');
// addHobbyButton.addEventListener('click', async () => {
//     const hobbyInput = document.getElementById('hobbyInput');
//     const newHobby = hobbyInput.value.trim();
//     if (newHobby) {
//         ///const userID = document.body.dataset.userId; // Access the user ID from the body's data attribute

//         try {
//             const response = await fetch('/addHobby', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ userID, hobby: newHobby }),
//             });

//             if (response.ok) {
//                 console.log('Hobby added successfully');
//                 // Update the hobbies list (optional)
//             } else {
//                 console.error('Error adding hobby');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }
// });

////Company Section.
const companyIcon = document.querySelector('.company-icon');
const companyDetails = document.querySelector('.company-details');
const ComID =document.body.getAttribute('data-user-ComID'); 

companyIcon.addEventListener('click', async () => {
    companyDetails.classList.toggle('active');

    if (companyDetails.classList.contains('active')) {        
        try {
            const response = await fetch(`/fetchCompany/${ComID}`);
            const company = await response.json();

            companyDetails.innerHTML = `
                <p><strong>Company Name:</strong> ${company.Name}</p>
                <p><strong>CEO:</strong> ${company.CEO}</p>
                <p><strong>Industry:</strong> ${company.Industry}</p>
                <p><strong>Headquarter:</strong> ${company.Origin}</p>
            `;
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    } else {
        companyDetails.innerHTML = '';
    }
});


document.addEventListener('click', (event) => {
    if (!notificationIcon.contains(event.target)) {
        notificationDetails.classList.remove('active');
    }
    if (!jobOfferIcon.contains(event.target)) {
        jobOfferDetails.classList.remove('active');
    }
    if (!companyIcon.contains(event.target)) {
        companyDetails.classList.remove('active');
    }
    if (!hobbyIcon.contains(event.target)) { 
        hobbyDetails.classList.remove('active');
    }
});